import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true, // High-speed lookup during checkout
      minlength: [3, "Code must be at least 3 characters"],
      maxlength: [20, "Code cannot exceed 20 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required for marketing clarity"],
      maxlength: [500, "Description too long"],
    },
    discountType: {
      type: String,
      enum: {
        values: ["percentage", "fixed"],
        message: "{VALUE} is not a supported discount type",
      },
      required: true,
    },
    discountAmount: {
      type: Number,
      required: [true, "Discount amount is required"],
      min: [0, "Discount cannot be negative"],
      // Custom validation: percentage cannot exceed 100%
      validate: {
        validator: function (val) {
          if (this.discountType === "percentage") return val <= 100;
          return true;
        },
        message: "Percentage discount cannot exceed 100%",
      },
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order amount cannot be negative"],
    },
    maxDiscount: {
      type: Number, // Essential for percentage-based coupons
      min: [0, "Max discount cannot be negative"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
      validate: {
        validator: function (val) {
          return val > Date.now();
        },
        message: "Expiry date must be in the future",
      },
    },
    usageLimit: {
      type: Number,
      default: 1000,
      min: [1, "Usage limit must be at least 1"],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
      // Prevent manual override from exceeding limit
      validate: {
        validator: function (val) {
          return val <= this.usageLimit;
        },
        message: "Used count cannot exceed usage limit",
      },
    },
    // Useful for category-specific promotions like "Pellisco20"
    applicableCategories: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true, // Index for quick filtering of active promotions
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User", // Track which admin created this coupon
      required: true,
    },
  },
  {
    timestamps: true,
    // Ensure virtuals are included when converting to JSON for frontend
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/* =========================
      ADVANCED INDEXING
========================= */

// Compound index for the Admin Dashboard to filter active/expired coupons quickly
couponSchema.index({ isActive: 1, expiryDate: 1 });

/* =========================
      VIRTUAL PROPERTIES
========================= */

// Check if coupon is still valid without hitting DB logic in controller
couponSchema.virtual("isValid").get(function () {
  return this.isActive && this.usedCount < this.usageLimit && this.expiryDate > Date.now();
});

export default mongoose.model("Coupon", couponSchema);
