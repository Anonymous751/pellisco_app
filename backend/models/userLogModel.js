import mongoose from "mongoose";

const ACTIONS = [
  "LOGIN",
  "LOGOUT",

  // Order lifecycle
  "ORDER_ATTEMPT",
  "ORDER_CREATED",
  "ORDER_FAILED",
  "ORDER_REJECTED",

  // Payment
  "PAYMENT_SUCCESS",
  "PAYMENT_FAILED",
  "PAYMENT_REJECTED",
];

const STATUS_ENUM = ["SUCCESS", "FAILED", "BLOCKED"];
const METHOD_ENUM = ["password", "otp", "google", "email", "phone"];

const userLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },

    action: {
      type: String,
      enum: ACTIONS,
      required: true,
      index: true,
    },

    ipAddress: {
      type: String,
      default: "N/A",
    },

    userAgent: {
      type: String,
      default: "N/A",
    },

    metadata: {
      status: {
        type: String,
        enum: STATUS_ENUM,
      },

      method: {
        type: String,
        enum: METHOD_ENUM,
      },

      reason: {
        type: String,
      },

      attempts: {
        type: Number,
        default: 0,
      },

      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        index: true,
      },

      paymentId: {
        type: String,
      },

      transactionId: {
        type: String,
      },

      gateway: {
        type: String,
      },

      amount: {
        type: Number,
      },

      currency: {
        type: String,
        default: "INR",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 20, // 🔥 TTL
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model("UserLog", userLogSchema);
