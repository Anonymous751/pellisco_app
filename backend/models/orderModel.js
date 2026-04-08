import mongoose from "mongoose";

const { Schema } = mongoose;

/* =========================
   SHIPPING SUB SCHEMA
========================= */

const shippingSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    phoneNo: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [250, "Address too long"],
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [80, "City name too long"],
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: [80, "State name too long"],
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      match: [/^[0-9]{5,6}$/, "Invalid postal code"],
    },
  },
  { _id: false }
);

/* =========================
   ORDER ITEM SUB SCHEMA
========================= */

const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },

    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name too long"],
    },

    image: {
      type: String,
      required: [true, "Product image is required"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Minimum quantity is 1"],
      max: [100, "Maximum quantity exceeded"],
    },
  },
  // { _id: false }
);

/* =========================
   COUPON SUB SCHEMA
========================= */

/* =========================
   COUPON SUB SCHEMA (Inside Order.js)
========================= */
const couponSchema = new Schema(
  {
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon", // This creates the link to your main Coupon model
    },
    couponCode: {
      type: String,
      uppercase: true,
      trim: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    // Useful for tracking: Was it a % or a Fixed discount at the time?
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
    }
  },
  { _id: false }
);

/* =========================
   SHIPMENT SUB SCHEMA
========================= */

const shipmentSchema = new Schema(
  {
    courier: {
      type: String,
      trim: true,
    },

    trackingNumber: {
      type: String,
      trim: true,
    },

    shippedAt: Date,

    estimatedDelivery: Date,
  },
  { _id: false }
);

/* =========================
   RETURN REQUEST SCHEMA
========================= */

const returnSchema = new Schema(
  {
    requested: {
      type: Boolean,
      default: false,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: [500, "Reason too long"],
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed"],
      default: "Pending",
    },

    requestedAt: Date,
  },
  { _id: false }
);

/* =========================
   REFUND SCHEMA
========================= */

const refundSchema = new Schema(
  {
    amount: {
      type: Number,
      min: [0, "Refund cannot be negative"],
    },

    status: {
      type: String,
      enum: ["Pending", "Processed", "Rejected"],
    },

    processedAt: Date,
  },
  { _id: false }
);

/* =========================
   MAIN ORDER SCHEMA
========================= */

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference required"],
      index: true,
    },

    orderItems: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one product",
      },
    },

    shippingInfo: {
      type: shippingSchema,
      required: true,
    },

    coupon: couponSchema,

    paymentInfo: {
      transactionId: String,

      paymentGateway: {
        type: String,
        enum: ["Stripe", "Razorpay", "PayPal", "COD"],
      },

      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "CARD", "UPI", "NETBANKING", "WALLET"],
      default: "COD",
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: Date,

    itemsPrice: {
      type: Number,
      required: true,
      min: [0, "Items price cannot be negative"],
    },

    taxPrice: {
      type: Number,
      default: 0,
      min: [0, "Tax cannot be negative"],
    },

    shippingPrice: {
      type: Number,
      default: 0,
      min: [0, "Shipping cannot be negative"],
    },

    discountPrice: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },

    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price cannot be negative"],
    },

    shipment: shipmentSchema,

    orderStatus: {
      type: String,
      enum: [
        "Processing",
        "Confirmed",
        "Packed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Processing",
    },

    deliveredAt: Date,

    statusHistory: [
  {
    status: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: String
    }
  }
],

    returnRequest: returnSchema,

    refund: refundSchema,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
