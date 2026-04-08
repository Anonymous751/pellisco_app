
import APIFunctionality from "../utils/apiFunctionality.js"; // Using your existing utility
import HandleError from "../utils/handleError.js";

import Coupon from "../models/couponModel.js";
import handleAsyncError from "../middlewares/handleAsyncError.js";

// @desc    Create New Coupon (Admin)
export const createCoupon = handleAsyncError(async (req, res, next) => {
  // 1. Attach the admin ID as the creator
  req.body.createdBy = req.user.id;

  // 2. Create the coupon (Mongoose handles the industry-level validations we added)
  const coupon = await Coupon.create(req.body);

  res.status(201).json({
    success: true,
    message: "Promotion created successfully",
    coupon,
  });
});

// @desc    Validate Coupon Code (Public/User Checkout)
export const validateCoupon = handleAsyncError(async (req, res, next) => {
  const { code, orderAmount, cartItems } = req.body;

  // 1. Find coupon (Case-insensitive check)
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true
  });

  if (!coupon) {
    return next(new HandleError("Invalid or inactive coupon code", 404));
  }

  // 2. TIME VALIDATION (Current Time vs Expiry Date)
  if (new Date() > coupon.expiryDate) {
    // Optional: Auto-disable if expired
    coupon.isActive = false;
    await coupon.save();
    return next(new HandleError("This coupon has expired", 400));
  }

  // 3. USAGE LIMIT VALIDATION
  if (coupon.usedCount >= coupon.usageLimit) {
    return next(new HandleError("Coupon usage limit reached", 400));
  }

  // 4. MINIMUM ORDER AMOUNT VALIDATION
  if (orderAmount < coupon.minOrderAmount) {
    return next(new HandleError(`Minimum order of ₹${coupon.minOrderAmount} required`, 400));
  }

  // 5. CATEGORY VALIDATION (Optional)
  if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
    const isApplicable = cartItems.some(item =>
      coupon.applicableCategories.includes(item.mainCategory?.toLowerCase()) ||
      coupon.applicableCategories.includes(item.category?.toLowerCase())
    );
    if (!isApplicable) {
      return next(new HandleError("Not applicable to items in your cart", 400));
    }
  }

  // 6. CALCULATE DISCOUNT
  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (orderAmount * coupon.discountAmount) / 100;
    // Apply Max Discount Cap if it exists
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = coupon.discountAmount;
  }

  res.status(200).json({
    success: true,
    message: "Coupon applied successfully",
    data: {
      couponId: coupon._id,
      code: coupon.code,
      discountAmount: Math.round(discountAmount),
      discountType: coupon.discountType
    }
  });
});


// @desc    Get Marketing Dashboard Summary (Admin)
export const getMarketingStats = handleAsyncError(async (req, res, next) => {
  // Count coupons by status
  const activeCoupons = await Coupon.countDocuments({ isActive: true });
  const totalCoupons = await Coupon.countDocuments();

  // Get all coupons for the PromoCards
  const coupons = await Coupon.find().sort("-createdAt").limit(6);

  // Mock Newsletter Data (or fetch from User/Subscriber model)
  const newsletterData = {
    totalSubscribers: 8432, // Replace with User.countDocuments({ newsletter: true })
    openRate: 42,
    recommendedTime: "7:00 PM IST"
  };

  res.status(200).json({
    success: true,
    stats: {
      activeCoupons,
      totalCoupons,
      newsletterData
    },
    coupons
  });
});


// @desc    Get All Coupons with Search & Filter (Admin Dashboard)
export const getAllCoupons = handleAsyncError(async (req, res, next) => {
  const resultPerPage = 10; // Slightly more for list views

  const apiFeatures = new APIFunctionality(
    Coupon.find().populate("createdBy", "name email"), // Shows which admin created it
    req.query
  )
    .search("code") // Search by Coupon Code
    .filter() // Filter by isActive or discountType
    .sort();

  const filteredQuery = apiFeatures.query.clone();
  const couponCount = await filteredQuery.countDocuments();
  const totalPages = Math.ceil(couponCount / resultPerPage);
  const page = Number(req.query.page) || 1;

  if (page > totalPages && couponCount > 0) {
    return next(new HandleError("This Page does not Exist", 404));
  }

  apiFeatures.pagination(resultPerPage);
  const coupons = await apiFeatures.query;

  res.status(200).json({
    success: true,
    coupons,
    resultPerPage,
    couponCount,
    totalPages,
    currentPage: page
  });
});

// @desc    Delete Coupon (Admin)
export const deleteCoupon = handleAsyncError(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new HandleError("Coupon not found", 404));
  }

  await coupon.deleteOne();

  res.status(200).json({
    success: true,
    message: "Promotion deleted successfully",
  });
});

// @desc    Toggle Coupon Status (Quick Action for Dashboard)
export const toggleCouponStatus = handleAsyncError(async (req, res, next) => {
  let coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new HandleError("Coupon not found", 404));
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  res.status(200).json({
    success: true,
    message: `Coupon is now ${coupon.isActive ? "Active" : "Disabled"}`,
    coupon
  });
});
