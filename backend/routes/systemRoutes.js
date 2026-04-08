import express from "express";
import { verifyUserAuth, roleBasedAccess } from "../middlewares/userAuth.js";
import { getSystemHealth, getSystemLogs } from "../controllers/systemController.js";

const router = express.Router();

/**
 * @route   GET /api/v1/system/health
 * @desc    System health check
 * @access  Admin
 */
router.get(
  "/health",
  verifyUserAuth,
  roleBasedAccess("admin"),
  getSystemHealth
);

// 🔥 Logs API
router.get(
  "/logs",
  verifyUserAuth,
  roleBasedAccess("admin"),
  getSystemLogs
);

export default router;
