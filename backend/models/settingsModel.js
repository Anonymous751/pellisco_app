import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "My Store",
    },
    supportEmail: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    // Payments
    enableStripe: {
      type: Boolean,
      default: false,
    },
    enablePaypal: {
      type: Boolean,
      default: false,
    },

    // Tax
    enableTax: {
      type: Boolean,
      default: false,
    },
    taxRate: {
      type: Number,
      default: 0,
    },

    // Notifications
    emailAlerts: {
      type: Boolean,
      default: true,
    },
    smsAlerts: {
      type: Boolean,
      default: false,
    },

    // Integrations
    webhookEnabled: {
      type: Boolean,
      default: false,
    },
    webhookUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
