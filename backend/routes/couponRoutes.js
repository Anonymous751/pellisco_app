import express from "express";


import { verifyUserAuth, roleBasedAccess } from "../middlewares/userAuth.js";
import { createCoupon, deleteCoupon, getAllCoupons, getMarketingStats, toggleCouponStatus, validateCoupon } from "../controllers/couponControllers.js";

const router = express.Router();

/* =========================
   PUBLIC / USER ROUTES
========================= */

// Validate coupon during checkout (User must be logged in to apply a code)
router.post("/coupon/validate", verifyUserAuth, validateCoupon);


/* =========================
   ADMIN ROUTES (Marketing Tab)
========================= */

// Get all dashboard stats (Coupons + Newsletter summary)
router.get(
  "/admin/marketing/stats",
  verifyUserAuth,
  roleBasedAccess("admin"),
  getMarketingStats
);

// Get all coupons for the Promo Cards list
router.get(
  "/admin/coupons",
  verifyUserAuth,
  roleBasedAccess("admin"),
  getAllCoupons
);

// Create a new campaign/coupon
router.post(
  "/admin/coupon/new",
  verifyUserAuth,
  roleBasedAccess("admin"),
  createCoupon
);



// Toggle Active/Expired status and Delete
router.route("/admin/coupon/:id")
  .put(verifyUserAuth, roleBasedAccess("admin"), toggleCouponStatus)
  .delete(verifyUserAuth, roleBasedAccess("admin"), deleteCoupon);

export default router;
