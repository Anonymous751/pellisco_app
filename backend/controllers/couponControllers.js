
import APIFunctionality from "../utils/apiFunctionality.js"; 
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

  // ✅ Input validation
  if (!code || !orderAmount || !Array.isArray(cartItems)) {
    return next(new HandleError("Invalid request data", 400));
  }

  // 1. Find coupon
  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    return next(new HandleError("Invalid or inactive coupon code", 404));
  }

  // 2. Expiry check
  if (!coupon.expiryDate || new Date() > new Date(coupon.expiryDate)) {
    coupon.isActive = false;
    await coupon.save();
    return next(new HandleError("This coupon has expired", 400));
  }

  // 3. Usage limit check
  if (coupon.usedCount >= coupon.usageLimit) {
    return next(new HandleError("Coupon usage limit reached", 400));
  }

  // 4. Minimum order check
  if (Number(orderAmount) < coupon.minOrderAmount) {
    return next(
      new HandleError(
        `Minimum order of ₹${coupon.minOrderAmount} required`,
        400
      )
    );
  }

  // 5. Category validation
  if (coupon.applicableCategories?.length > 0) {
    const normalize = (str) =>
      String(str || "")
        .toLowerCase()
        .replace(/[-_\s]/g, "")
        .trim();

    const isApplicable = cartItems.some((item) => {
      const itemCategory = normalize(item.mainCategory || item.category);

      return coupon.applicableCategories.some(
        (cat) => normalize(cat) === itemCategory
      );
    });

    if (!isApplicable) {
      return next(
        new HandleError("Not applicable to items in your cart", 400)
      );
    }
  }

  // 6. Discount calculation
  let discountAmount = 0;

  if (coupon.discountType === "percentage") {
    discountAmount = (Number(orderAmount) * coupon.discountAmount) / 100;

    if (
      coupon.maxDiscount &&
      discountAmount > coupon.maxDiscount
    ) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = coupon.discountAmount;
  }

  // 7. Final response
  return res.status(200).json({
    success: true,
    message: "Coupon applied successfully",
    data: {
      couponId: coupon._id,
      code: coupon.code,
      discountAmount: Math.round(discountAmount),
      discountType: coupon.discountType,
    },
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
