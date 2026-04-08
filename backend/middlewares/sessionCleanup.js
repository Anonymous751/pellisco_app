  // backend/middlewares/sessionCleanup.js
  import cron from "node-cron";
  import { Session } from "../models/SessionModel.js";

  // A. THE AUTOMATED CLEANUP (Runs in background)
  const closeExpiredSessions = async () => {
    try {
      const timeoutLimit = new Date(Date.now() - 60000); // 2 minutes
      const result = await Session.updateMany(
        { lastPing: { $lt: timeoutLimit }, isLive: true },
        { $set: { isLive: false } }
      );

      if (result.modifiedCount > 0) {
        console.log(`--- 🧹 CLEANUP: ${result.modifiedCount} sessions marked offline ---`);
      }
    } catch (error) {
      console.error("Cleanup Error:", error);
    }
  };

  export const startSessionCleanupJob = () => {
    cron.schedule("*/2 * * * *", () => closeExpiredSessions());
  };

  // B. THE ROUTE HANDLER (Called by React)
  export const trackPulse = async (req, res) => {
    const { sessionId, currentPath, deviceInfo } = req.body;

    try {
      await Session.findOneAndUpdate(
        { sessionId },
        {
          $set: {
            lastPing: new Date(),
            isLive: true,
            deviceInfo: deviceInfo
          },
          $addToSet: { pagesVisited: currentPath },
          $setOnInsert: { startTime: new Date(), user: req.user?._id || null }
        },
        { upsert: true, new: true }
      );
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  };

  export const sessionMiddleware = async (req, res, next) => {
  const sessionId = req.headers['x-session-id'];
  const currentPath = req.headers['x-current-path'] || req.originalUrl;

  if (sessionId) {
    try {
      // We don't "await" this to keep the API fast
      Session.findOneAndUpdate(
        { sessionId },
        {
          $set: { lastPing: new Date(), isLive: true },
          $addToSet: { pagesVisited: { path: currentPath, timestamp: new Date() } },
          $setOnInsert: { startTime: new Date(), user: req.user?._id || null }
        },
        { upsert: true }
      ).exec(); // .exec() fires it off in the background
    } catch (err) {
      console.error("Session Middleware Error:", err);
    }
  }
  next();
};
