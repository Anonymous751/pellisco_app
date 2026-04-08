import mongoose from "mongoose";

const partnershipSchema = new mongoose.Schema({
  // Link this to the user so we don't rely on email strings
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  salonName: {
    type: String,
    required: [true, "Salon name is required"],
  },
  website: { type: String },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
  },
  rooms: { type: String },
  role: {
    type: String,
    // 🛑 THIS MUST MATCH YOUR PARTNERSHIP STATUS EXACTLY
    enum: ["user", "admin", "verified"],
    default: "user",
  },
  philosophy: {
    type: String,
    required: [true, "Please provide your clinical philosophy"],
  },
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"], // Matches your frontend logic
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Partnership = mongoose.model("Partnership", partnershipSchema);
