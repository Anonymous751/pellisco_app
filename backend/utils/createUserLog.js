import userLog from "../models/userLogModel.js";
import { getIO } from "../socket.js";

export const createUserLog = async ({
  user,
  action,
  req = null,
  performedBy = null,
  metadata = {},
}) => {
  try {
    if (!user || !action) {
      console.warn("⚠️ Log skipped: missing user or action");
      return;
    }

    if (!performedBy && req?.user?._id) {
      performedBy = req.user._id;
    }

    const ipAddress =
      req?.headers?.["x-forwarded-for"]?.split(",")[0] ||
      req?.socket?.remoteAddress ||
      req?.ip ||
      "N/A";

    const userAgent = req?.headers?.["user-agent"] || "N/A";

    // ✅ Step 1: Create log safely
    const log = await userLog.create({
      user,
      action,
      performedBy: performedBy || user,
      ipAddress,
      userAgent,
      metadata,
    });

    console.log("✅ Log created");

    // ✅ Step 2: Emit socket ONLY if needed
    const io = getIO();
    if (io) {
      io.emit("new-log", {
        action: log.action,
        user: log.user,
        createdAt: log.createdAt,
      }); // ⚡ send only minimal data (important)
    }

  } catch (err) {
    console.error("❌ UserLog Error:", err);
  }
};
