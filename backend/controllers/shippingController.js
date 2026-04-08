import Shipping from "../models/shippingModel.js";
import handleAsyncError from "../middlewares/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import User from "../models/userModel.js";

/**
 * @desc    Get Logistics Dashboard Stats with Trend Analysis
 * @route   GET /api/v1/admin/shipping/stats
 */
export const getShippingStats = handleAsyncError(async (req, res, next) => {
  const stats = await Shipping.aggregate([
    {
      $facet: {
        statusCounts: [
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ],
        // Dynamically calculate value of active shipments
        activeValue: [
          { $match: { status: { $ne: "Delivered" } } },
          { $group: { _id: null, total: { $sum: "$shippingCost.amount" } } }
        ],
        totalCount: [{ $count: "count" }]
      }
    }
  ]);

  const statusData = stats[0].statusCounts || [];
  const total = stats[0].totalCount[0]?.count || 0;

  const deliveredCount = statusData.find(s => s._id === "Delivered")?.count || 0;
  const delayedCount = statusData.find(s => s._id === "Delayed")?.count || 0;

  // Active = Everything currently in the pipeline
  const activeStatuses = ["Pending", "Processing", "Confirmed", "Packed", "Shipped", "Out for Delivery"];
  const activeCount = statusData
    .filter(s => activeStatuses.includes(s._id))
    .reduce((acc, curr) => acc + curr.count, 0);

  const successRate = total > 0 ? parseFloat(((deliveredCount / total) * 100).toFixed(1)) : 100;

  res.status(200).json({
    success: true,
    stats: {
      activeShipments: activeCount,
      deliveredToday: deliveredCount,
      delayedAlerts: delayedCount,
      successRate: successRate,
      activeFleetValue: stats[0].activeValue[0]?.total || 0
    }
  });
});

/**
 * @desc    Get All Shipments (Fully Populated & Searchable)
 * @route   GET /api/v1/admin/shipping/all
 */
/**
 * @desc    Get All Shipments (Fully Populated & Searchable)
 * @route   GET /api/v1/admin/shipping/all
 */
/**
 * @desc    Get All Shipments (Fully Populated & Searchable)
 * @route   GET /api/v1/admin/shipping/all
 */
export const getAllShipments = handleAsyncError(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  let query = {};

  if (req.query.keyword) {
    query.$or = [
      { shipmentId: { $regex: req.query.keyword, $options: "i" } },
      { trackingNumber: { $regex: req.query.keyword, $options: "i" } }
    ];
  }

  if (req.query.status) query.status = req.query.status;

  const totalShipments = await Shipping.countDocuments(query);

  const shipments = await Shipping.find(query)
    .populate("user", "name email phone")
    .populate({
      path: "order",
      select: "orderId totalPrice totalAmount totalQuantity items orderItems shippingAddress",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const formattedShipments = shipments.map((ship) => {
    const hasOrder = !!ship.order;
    const hasUser = !!ship.user;

    // --- ADDRESS & PHONE WATERFALL LOGIC ---
    // We prioritize Order data, but fallback to Shipment Destination data
    // This ensures Toronto (missing order) still shows its phone and street.
    const finalAddress = {
      address: ship.order?.shippingAddress?.address || ship.destination?.address || "Address Missing",
      city: ship.order?.shippingAddress?.city || ship.destination?.city || "Unknown",
      state: ship.order?.shippingAddress?.state || ship.destination?.state || "",
      country: ship.order?.shippingAddress?.country || ship.destination?.country || "",
      phone: ship.order?.shippingAddress?.phone || ship.destination?.phone || "No Phone Provided"
    };

    return {
      ...ship,
      user: hasUser ? ship.user : { name: "Guest User", email: "N/A", phone: "N/A" },

      order: hasOrder ? {
        orderId: ship.order.orderId || ship.order._id,
        totalPrice: ship.order.totalPrice || ship.order.totalAmount || 0,
        totalQuantity: ship.order.totalQuantity ||
                       (ship.order.items?.length) ||
                       (ship.order.orderItems?.length) || 0,
        shippingAddress: finalAddress // Using the corrected address object
      } : {
        orderId: `REF: ${ship.shipmentId}`,
        totalPrice: ship.shippingCost?.amount || 0,
        totalQuantity: 1,
        shippingAddress: finalAddress // Even without an order, we show the destination details
      }
    };
  });

  res.status(200).json({
    success: true,
    totalShipments,
    pages: Math.ceil(totalShipments / limit),
    shipments: formattedShipments
  });
});

/**
 * @desc    Create Shipment
 * @route   POST /api/v1/admin/shipping/create
 */
/**
 * @desc    Initialize Fulfillment (Create Shipment & Sync User)
 * @route   POST /api/v1/shipping
 * @access  Admin
 */
export const createShipment = handleAsyncError(async (req, res, next) => {
  // Destructure from req.body
  const {
    order,
    user,
    destination,
    carrier,
    shippingMethod,
    eta,
    shippingCost
  } = req.body;

  // 1. STAGE ONE: Validation
  // Ensure we have the minimum viable data to move a package
  if (!order || !user || !destination?.city || !carrier) {
    return next(new HandleError("Order reference, User ID, and Destination City are mandatory for fulfillment.", 400));
  }

  // 2. STAGE TWO: Duplicate Prevention
  // Check if this specific Order ID is already tied to a Shipment
  const existingShipment = await Shipping.findOne({ order });
  if (existingShipment) {
    return next(new HandleError(`Fulfillment already initialized for Order: ${order}`, 400));
  }

  // 3. STAGE THREE: Database Creation
  const shipment = await Shipping.create({
    order,
    user,
    destination,
    carrier,
    shippingMethod,
    eta,
    shippingCost: shippingCost || { amount: 0, currency: "NGN" },
    status: "Pending", // Ensure every new record starts at 'Pending'
    logs: [{
      status: "Pending",
      message: "Fulfillment initialized. Shipment record generated by Admin.",
      performedBy: req.user._id, // Audit trail: who clicked the button?
      location: "Main Warehouse Hub"
    }]
  });

  // 4. STAGE FOUR: The "Sagar Sync" (Atomic Increment)
  // This is the bridge that fixes the '0 Orders' bug in your User Directory
  await User.findByIdAndUpdate(user, {
    $inc: { orderCount: 1 }
  });

  // 5. STAGE FIVE: Success Response
  res.status(201).json({
    success: true,
    message: "Fulfillment successfully initialized. User order stats updated.",
    shipment
  });
});
/**
 * @desc    Update Status with Dynamic Logging
 * @route   PUT /api/v1/admin/shipping/update/:id
 */
export const updateShippingStatus = handleAsyncError(async (req, res, next) => {
  const { status, message, location, trackingNumber } = req.body;

  const shipment = await Shipping.findById(req.params.id);
  if (!shipment) return next(new HandleError("Shipment not found", 404));

  // Logic: Prevent changes once Delivered (for security/audit)
  if (shipment.status === "Delivered") {
    return next(new HandleError("Cannot modify a delivered shipment record", 400));
  }

  // Update Core Fields
  shipment.status = status;
  if (trackingNumber) shipment.trackingNumber = trackingNumber;

  // Add to Dynamic History Log
  shipment.logs.push({
    status,
    message: message || `Status updated to ${status}`,
    location: location || "Logistics Hub",
    performedBy: req.user?._id,
    timestamp: new Date()
  });

  await shipment.save();

  res.status(200).json({
    success: true,
    message: `Shipment status synced to: ${status}`,
    shipment
  });
});


