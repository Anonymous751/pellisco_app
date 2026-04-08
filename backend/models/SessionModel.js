import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Remains null for guest visitors
    },
    sessionId: {
      type: String,
      required: [true, "Session ID is required"],
      unique: true,
      trim: true,
      index: true, // Fast lookup for heartbeats
    },
    startTime: {
      type: Date,
      default: Date.now,
      immutable: true, // The start time should never change
    },
    lastPing: {
      type: Date,
      default: Date.now,
      
    },
    pagesVisited: [
      {
        path: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    deviceInfo: {
      browser: { type: String, default: "unknown" },
      os: { type: String, default: "unknown" },
      isMobile: { type: Boolean, default: false },
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    isLive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// --- PERFORMANCE & CLEANUP INDEXES ---

// 1. TTL Index: Automatically delete sessions after 24 hours of inactivity
// This prevents your MongoDB from growing too large with old guest data
sessionSchema.index({ lastPing: 1 }, { expireAfterSeconds: 86400 });

// 2. Compound Index: Quickly find active sessions for a specific user
sessionSchema.index({ user: 1, isLive: 1 });

// --- SCHEMA METHODS ---

// Method to check if session is still active (e.g., within last 2 minutes)
sessionSchema.methods.checkActivity = function () {
  const diff = Date.now() - this.lastPing.getTime();
  return diff < 120000; // 120,000ms = 2 minutes
};

export const Session = mongoose.model("Session", sessionSchema);
