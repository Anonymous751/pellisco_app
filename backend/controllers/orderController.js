import handleAsyncError from "../middlewares/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import { Session } from "../models/SessionModel.js";
import redisClient from "../config/redis.js";
import { createUserLog } from "../utils/createUserLog.js";
import Coupon from "../models/couponModel.js";

export const createNewOrder = handleAsyncError(async (req, res, next) => {
  const { shippingInfo, orderItems, paymentInfo, coupon } = req.body;

  // 🧾 LOG: ORDER ATTEMPT
  createUserLog({
    user: req.user._id,
    action: "ORDER_ATTEMPT",
    req,
    metadata: {
      items: orderItems?.length || 0,
    },
  }).catch(console.error);

  if (!orderItems || orderItems.length === 0) {
    // 🧾 LOG: ORDER REJECTED
    createUserLog({
      user: req.user._id,
      action: "ORDER_REJECTED",
      req,
      metadata: {
        reason: "No order items found",
      },
    }).catch(console.error);

    return next(new HandleError("No order items found", 400));
  }

  let itemsPrice = 0;
  const validatedItems = [];

  // 🔍 VALIDATE ITEMS
  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      // 🧾 LOG: ORDER FAILED
      createUserLog({
        user: req.user._id,
        action: "ORDER_FAILED",
        req,
        metadata: {
          reason: "Product not found",
          productId: item.product,
        },
      }).catch(console.error);

      return next(new HandleError("Product not found", 404));
    }

    const price = product.price.sale;

    // Variant check
    if (item.variantSku) {
      const variant = product.variants.find((v) => v.sku === item.variantSku);

      if (!variant) {
        // 🧾 LOG: ORDER FAILED
        createUserLog({
          user: req.user._id,
          action: "ORDER_FAILED",
          req,
          metadata: {
            reason: "Variant not found",
            sku: item.variantSku,
          },
        }).catch(console.error);

        return next(new HandleError("Product variant not found", 404));
      }

      if (variant.stock < item.quantity) {
        // 🧾 LOG: ORDER REJECTED
        createUserLog({
          user: req.user._id,
          action: "ORDER_REJECTED",
          req,
          metadata: {
            reason: "Insufficient stock",
            product: product.name,
          },
        }).catch(console.error);

        return next(
          new HandleError(`Insufficient stock for ${product.name}`, 400)
        );
      }
    } else {
      if (product.stock < item.quantity) {
        // 🧾 LOG: ORDER REJECTED
        createUserLog({
          user: req.user._id,
          action: "ORDER_REJECTED",
          req,
          metadata: {
            reason: "Insufficient stock",
            product: product.name,
          },
        }).catch(console.error);

        return next(
          new HandleError(`Insufficient stock for ${product.name}`, 400)
        );
      }
    }

    itemsPrice += price * item.quantity;

    validatedItems.push({
      product: product._id,
      name: product.name,
      price,
      image: product.images?.[0]?.url || "",
      quantity: item.quantity,
      variantSku: item.variantSku || null,
    });
  }

  const taxPrice = Number((itemsPrice * 0.18).toFixed(2));
  const shippingPrice = itemsPrice > 1000 ? 0 : 50;

  // ✅ FIX STARTS HERE
  let discountPrice = 0;

  if (coupon?.couponId) {
    const validCoupon = await Coupon.findById(coupon.couponId);

    if (validCoupon && validCoupon.isActive) {
      if (validCoupon.discountType === "percentage") {
        discountPrice = (itemsPrice * validCoupon.discountAmount) / 100;

        if (
          validCoupon.maxDiscount &&
          discountPrice > validCoupon.maxDiscount
        ) {
          discountPrice = validCoupon.maxDiscount;
        }
      } else {
        discountPrice = validCoupon.discountAmount;
      }

      // 🔢 Increase usage
      validCoupon.usedCount += 1;
      await validCoupon.save();
    }
  }
  // ✅ FIX ENDS HERE

  const totalPrice = itemsPrice + taxPrice + shippingPrice - discountPrice;
  const isPaid = paymentInfo?.status === "paid";

  // 📦 CREATE ORDER
  const order = await Order.create({
    shippingInfo,
    orderItems: validatedItems,
    paymentInfo,
    coupon,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountPrice,
    totalPrice,
    user: req.user._id,
    isPaid,
    paidAt: isPaid ? Date.now() : null,
  });

  // 🧾 LOG: ORDER CREATED
  createUserLog({
    user: req.user._id,
    action: "ORDER_CREATED",
    req,
    metadata: {
      orderId: order._id,
      amount: totalPrice,
      items: validatedItems.length,
    },
  }).catch(console.error);

  // 💳 LOG: PAYMENT STATUS
  createUserLog({
    user: req.user._id,
    action: isPaid ? "PAYMENT_SUCCESS" : "PAYMENT_FAILED",
    req,
    metadata: {
      orderId: order._id,
      amount: totalPrice,
      method: paymentInfo?.method || "unknown",
      status: isPaid ? "SUCCESS" : "FAILED",
    },
  }).catch(console.error);

  // 📉 REDUCE STOCK
  for (const item of validatedItems) {
    const product = await Product.findById(item.product);

    if (item.variantSku) {
      const variant = product.variants.find((v) => v.sku === item.variantSku);
      variant.stock -= item.quantity;
    } else {
      product.stock -= item.quantity;
    }

    await product.save({ validateBeforeSave: false });
  }

  // 👤 UPDATE USER
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $inc: { numOfOrders: 1, totalSpent: totalPrice },
      $set: { city: shippingInfo.city || "Not Specified" },
    },
    { new: true, runValidators: false }
  );

  if (!updatedUser) {
    console.error("❌ USER NOT FOUND");
  } else {
    // 🧠 TIER CALCULATION
    let newTier = "Brown";
    const total = updatedUser.totalSpent;

    if (total >= 100000) newTier = "Platinum";
    else if (total >= 50000) newTier = "Gold";
    else if (total >= 10000) newTier = "Silver";

    // 🔄 UPDATE TIER IF CHANGED
    if (updatedUser.tier !== newTier) {
      updatedUser.tier = newTier;
      await updatedUser.save({ validateBeforeSave: false });

      // 🧾 LOG: TIER UPGRADE
      createUserLog({
        user: updatedUser._id,
        action: "TIER_UPGRADED",
        req,
        metadata: {
          newTier,
          totalSpent: updatedUser.totalSpent,
        },
      }).catch(console.error);
    }

    console.log("✅ USER UPDATED:", {
      totalSpent: updatedUser.totalSpent,
      orders: updatedUser.numOfOrders,
      tier: updatedUser.tier,
    });
  }

  // ⚡ CACHE INVALIDATION
  await redisClient.del("admin_all_orders_*");
  await redisClient.del("analytics_stats");
  const keys = await redisClient.keys(`my_orders_${req.user._id}_*`);
  if (keys.length) {
    await redisClient.del(keys);
  }

  // ✅ RESPONSE
  res.status(201).json({
    success: true,
    order,
  });
});

export const getSingleOrder = handleAsyncError(async (req, res, next) => {
  // REDIS OPTIMIZATION: Try to get from cache first
  const cacheKey = `order_${req.params.id}`;
  const cachedOrder = await redisClient.get(cacheKey);

  if (cachedOrder) {
    const order = JSON.parse(cachedOrder);
    // Security check on cached data
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return next(new HandleError("Not authorized to access this order", 403));
    }
    return res.status(200).json({ success: true, order });
  }

  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("orderItems.product", "name images price");

  if (!order) {
    return next(new HandleError("Order not found", 404));
  }

  // Security check
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new HandleError("Not authorized to access this order", 403));
  }

  // Store in redisClient for 1 hour
  await redisClient.setEx(cacheKey, 3600, JSON.stringify(order));

  res.status(200).json({
    success: true,
    order,
  });
});

// All my orders - Logged In User
export const allMyOrders = handleAsyncError(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const keyword = req.query.keyword ? req.query.keyword.trim() : "";
  console.log("REQ USER:", req.user);

  // redisClient OPTIMIZATION: Use composite key including page, limit and keyword
  const cacheKey = `my_orders_${req.user._id}_p${page}_l${limit}_k${keyword}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData && !keyword) {
    // Don't cache complex searches for now
    return res.status(200).json(JSON.parse(cachedData));
  }

  // 1. Base Query: Always restrict to the current user
  let query = { user: req.user._id };

  // 2. Advanced Partial Search Logic
  if (keyword) {
    query.$or = [
      // Match the START of the Order ID (Sequence matching)
      {
        $expr: {
          $regexMatch: {
            input: { $toString: "$_id" },
            regex: `^${keyword}`, // '^' ensures it matches from the first letter
            options: "i",
          },
        },
      },
      // Also allow searching by Product Name
      { "orderItems.name": { $regex: keyword, $options: "i" } },
    ];
  }

  // 3. Execution
  const orders = await Order.find(query)
  .select(
    "_id user orderItems itemsPrice taxPrice discountPrice totalPrice orderStatus createdAt shippingInfo shippingPrice"
  )
  .populate("user", "name email avatar") // ✅ FIXED
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);

  console.log("ORDER USER:", orders[0]?.user);

  const totalOrders = await Order.countDocuments(query);

  // 4. Clean Formatting for Pellisco UI
  const formattedOrders = orders.map((order) => ({
    _id: order._id,
    user: order.user,

    itemsPrice: order.itemsPrice, // ✅ ADD
    taxPrice: order.taxPrice, // ✅ ADD
    discountPrice: order.discountPrice, // ✅ ADD
    totalPrice: order.totalPrice,
    orderStatus: order.orderStatus,
    createdAt: order.createdAt,
    shippingInfo: order.shippingInfo,
    shippingPrice: order.shippingPrice,
    orderItems: order.orderItems,
    thumbnail: order.orderItems[0]?.image || null,
  }));

  const responseData = {
    success: true,
    page,
    totalPages: Math.ceil(totalOrders / limit),
    totalOrders,
    orders: formattedOrders,
  };

  // Cache user orders for 30 minutes
  if (!keyword) {
    await redisClient.setEx(cacheKey, 1800, JSON.stringify(responseData));
  }

  res.status(200).json(responseData);
});
//  Get All Orders - Admin Access?

export const getAdminAllOrders = handleAsyncError(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // 1. Total Orders
  const totalOrders = await Order.countDocuments();

  // 2. Orders List - ADDED 'shippingInfo' and 'orderItems' to .select()
  const orders = await Order.find()
    .select(
      "_id user totalPrice orderStatus paymentMethod isPaid createdAt shippingInfo orderItems"
    )
    // We populate the 'user' field and pull 'city' and 'createdAt' from the User model
    .populate("user", "name email createdAt city")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  // 3. Total Revenue
  const revenueResult = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        orderStatus: { $ne: "Cancelled" },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$totalPrice" },
      },
    },
  ]);

  const totalRevenue = Number((revenueResult[0]?.revenue || 0).toFixed(2));

  res.status(200).json({
    success: true,
    page,
    totalPages: Math.ceil(totalOrders / limit),
    totalOrders,
    totalRevenue,
    orders,
  });
});

// Update Order Status - Admin
export const updateOrderStatus = handleAsyncError(async (req, res, next) => {
  const { orderStatus } = req.body;

  // 1. Find Order
  const order = await Order.findById(req.params.id);
  if (!order) return next(new HandleError("Order not found", 404));

  if (order.orderStatus === "Delivered") {
    return next(new HandleError("Order already delivered", 400));
  }

  const previousStatus = order.orderStatus;

  // 2. Handle Delivery Logic
  if (orderStatus === "Delivered") {
    const user = await User.findById(order.user);

    if (user) {
      const TIER_MULTIPLIERS = {
        Brown: 1,
        Silver: 1.2,
        Gold: 1.5,
        Platinum: 2,
      };

      const multiplier = TIER_MULTIPLIERS[user.tier] || 1;
      const earnedPoints = Math.round(order.totalPrice * multiplier);

      user.points = (user.points || 0) + earnedPoints;
      user.totalSpent = (user.totalSpent || 0) + order.totalPrice;

      let newTier = "Brown";
      if (user.totalSpent >= 100000) newTier = "Platinum";
      else if (user.totalSpent >= 50000) newTier = "Gold";
      else if (user.totalSpent >= 10000) newTier = "Silver";

      if (user.tier !== newTier) {
        user.tier = newTier;
      }

      await user.save({ validateBeforeSave: false });

      // ✅ LOG: Points + Tier Update
      await createUserLog({
        user: user._id,
        action: "USER_REWARDED",
        req,
        metadata: {
          orderId: order._id,
          earnedPoints,
          newTier: user.tier,
          totalSpent: user.totalSpent,
        },
      });
    }

    // Stock update
    for (const item of order.orderItems) {
      await updateStock(item.product, item.quantity);
    }

    order.deliveredAt = Date.now();
  }

  // 3. Update Order Status
  order.orderStatus = orderStatus;

  // 4. Status History
  order.statusHistory.push({
    status: orderStatus,
    date: Date.now(),
    updatedBy: req.user._id,
  });

  await order.save();

  // ✅ LOG: Order Status Change
  await createUserLog({
    user: order.user,
    action: "ORDER_STATUS_UPDATED",
    req,
    performedBy: req.user._id,
    metadata: {
      orderId: order._id,
      previousStatus,
      newStatus: orderStatus,
    },
  });

  // 5. Cache Invalidation
  await Promise.all([
    redisClient.del(`order_${req.params.id}`),
    redisClient.del(`my_orders_${order.user}_*`),
    redisClient.del("analytics_stats"),
  ]);

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    order,
  });
});

const updateStock = async (productId, quantity) => {
  const product = await Product.findById(productId);

  if (!product) return;

  product.stock -= quantity;

  await product.save({ validateBeforeSave: false });
};

// Add this to your orderController.js
export const deleteOrder = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new HandleError("Order not found with this ID", 404));
  }

  const userId = order.user;
  await order.deleteOne();

  // redisClient: Invalidate
  await redisClient.del(`order_${req.params.id}`);
  await redisClient.del(`my_orders_${userId}_*`);
  await redisClient.del("analytics_stats");

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});

export const getAdminOrderStats = handleAsyncError(async (req, res, next) => {
  const totalOrders = await Order.countDocuments();

  const inTransitCount = await Order.countDocuments({
    orderStatus: { $in: ["Shipped", "Out for Delivery"] },
  });

  const completedCount = await Order.countDocuments({
    orderStatus: "Delivered",
  });

  const pendingActionCount = await Order.countDocuments({
    orderStatus: { $in: ["Processing", "Confirmed", "Packed"] },
  });

  const cancelledCount = await Order.countDocuments({
    orderStatus: "Cancelled",
  });

  const returnedCount = await Order.countDocuments({
    orderStatus: "Returned",
  });

  // FIX: Use the variables directly, NOT data.variable
  res.status(200).json({
    success: true,
    stats: {
      totalOrders, // This is shorthand for totalOrders: totalOrders
      inTransitCount,
      completedCount,
      pendingActionCount,
      cancelledCount,
      returnedCount,
    },
  });
});

// orderController.js

export const redeemPoints = handleAsyncError(async (req, res, next) => {
  const { pointsToRedeem } = req.body; // e.g., 500
  const user = await User.findById(req.user._id);

  if (!user.points || user.points < pointsToRedeem) {
    return next(new HandleError("Insufficient skin points", 400));
  }

  // Define your conversion rate (e.g., 10 points = 1 Rupee)
  const conversionRate = 0.1;
  const discountAmount = Math.floor(pointsToRedeem * conversionRate);

  // Deduct points from user
  user.points -= pointsToRedeem;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    discountAmount, // Send this back to frontend to apply to the checkout total
    remainingPoints: user.points,
  });
});

export const getAnalyticsStats = handleAsyncError(async (req, res, next) => {
  // 1. SKIP REDIS CACHE FOR LIVE UPDATES
  // During development/live tracking, we bypass the cache check to query the DB directly
  const cacheKey = "analytics_stats";

  // 2. SESSION & USER TRACKING (LIVE FROM DB)
  // Count total unique session documents for "Total Visitors"
  const dbVisitors = await Session.countDocuments();

  // If DB is empty, default to 1 (yourself) so Conversion Rate doesn't look broken
  const totalVisitors = dbVisitors > 0 ? dbVisitors : 1;

  // Count only currently active sessions for "Live Now"
  const liveUsers = await Session.countDocuments({ isLive: true });

  // Total registered accounts
  const totalUsers = await User.countDocuments();

  // 3. ORDER & REVENUE AGGREGATION
  const stats = await Order.aggregate([
    {
      $facet: {
        revenueData: [
          {
            $match: {
              isPaid: true,
              orderStatus: { $ne: "Cancelled" },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalPrice" },
              totalOrders: { $sum: 1 },
              avgOrderValue: { $avg: "$totalPrice" },
            },
          },
        ],
        weeklySales: [
          {
            $match: {
              createdAt: {
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
              isPaid: true,
            },
          },
          {
            $group: {
              _id: { $dayOfWeek: "$createdAt" },
              amount: { $sum: "$totalPrice" },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  const data = stats[0].revenueData[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
  };

  // 4. BUSINESS LOGIC CALCULATIONS
  const conversionRate =
    totalVisitors > 0
      ? ((data.totalOrders / totalVisitors) * 100).toFixed(2)
      : 0;

  // 5. CONSTRUCT RESPONSE
  const responseBody = {
    success: true,
    analytics: {
      totalRevenue: data.totalRevenue,
      totalOrders: data.totalOrders,
      totalUsers,
      totalVisitors,
      liveUsers: liveUsers > 0 ? liveUsers : 1, // Ensure at least 1 (the admin) shows up
      avgOrderValue: Math.round(data.avgOrderValue),
      conversionRate: `${conversionRate}%`,
      weeklyChart: stats[0].weeklySales,
    },
  };

  // 6. OPTIONAL: RE-CACHE WITH VERY SHORT TTL (5 Seconds)
  // This prevents database spam if you refresh rapidly but keeps it "Live"
  await redisClient.setEx(cacheKey, 5, JSON.stringify(responseBody));

  res.status(200).json(responseBody);
});

export const trackPulse = async (req, res) => {
  const { sessionId, currentPath, deviceInfo } = req.body;

  try {
    await Session.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          lastPing: new Date(),
          isLive: true,
          deviceInfo: deviceInfo, // Using the info sent from React
        },
        $push: { pagesVisited: { path: currentPath, timestamp: new Date() } },
        $setOnInsert: { startTime: new Date(), user: req.user?._id || null },
      },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("DETAILED TRACKING ERROR:", error);
    res.status(500).json({ success: false });
  }
};
