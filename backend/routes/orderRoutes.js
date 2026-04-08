import express from "express";
import {
  allMyOrders,
  createNewOrder,
  deleteOrder,
  getAdminAllOrders,
  getAdminOrderStats,
  getAnalyticsStats,
  getSingleOrder,
  redeemPoints,
  trackPulse,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { roleBasedAccess, verifyUserAuth } from "../middlewares/userAuth.js";

const router = express.Router();

// ==========================================
// 1. PUBLIC / USER ROUTES (Requires Login)
// ==========================================

// Add this above your other route uses
router.post("/analytics/pulse", trackPulse);

// controller: redeemPoints
router.post("/points/redeem", verifyUserAuth, redeemPoints);

router.get("/orders/me", verifyUserAuth, allMyOrders);

// 2. Dynamic ID routes SECOND
router.get("/order/:id", verifyUserAuth, getSingleOrder);

// Create a new order
router.post("/new/order", verifyUserAuth, createNewOrder);

// Get logged-in user's order history (Pagination & Search)


// ==========================================
// 2. ADMIN ONLY ROUTES (Requires Admin Role)
// ==========================================

// This is the new one for your AAnalytics.jsx component
router.get(
  "/admin/analytics",
  verifyUserAuth,
  roleBasedAccess("admin"),
  getAnalyticsStats // Make sure to import this from your controller
);


// Get all orders across the platform
router.get(
  "/admin/orders",
  verifyUserAuth,
  roleBasedAccess("admin"),
  getAdminAllOrders
);

// Get specific order details (Admin view)
router.get(
  "/admin/order/:id",
  verifyUserAuth,
  roleBasedAccess("admin"),
  getSingleOrder
);

// Update order status (Processing -> Shipped -> Delivered)
router.put(
  "/admin/order/:id/status",
  verifyUserAuth,
  roleBasedAccess("admin"),
  updateOrderStatus
);

// Add this in your ADMIN ONLY ROUTES section
router.delete(
  "/admin/order/:id",
  verifyUserAuth,
  roleBasedAccess("admin"),
  deleteOrder
);

// Get dashboard statistics (Revenue, Order counts)
router.get(
  "/admin/orders/stats",
  verifyUserAuth,
  roleBasedAccess("admin"),
  getAdminOrderStats
);

export default router;
