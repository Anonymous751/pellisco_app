import mongoose from "mongoose";

const systemLogSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    responseTime: {
      type: Number, // in ms
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: ["slow", "error", "normal"],
      default: "normal",
    },
  },
  { timestamps: true }
);

export const SystemLog = mongoose.model("SystemLog", systemLogSchema);
