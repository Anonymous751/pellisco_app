import express from "express";
import {
  getAllInquiries,
  handlePartnershipInquiry,
  updateInquiryStatus,
  getMyInquiryStatus, // <--- Make sure to import this!
} from "../controllers/partnershipController.js";
import { roleBasedAccess, verifyUserAuth } from "../middlewares/userAuth.js";

const router = express.Router();


/** * LEVEL 1: USER ACCESS
 * Available to anyone logged in (role: 'user', 'partner', or 'admin')
 */

// 1. Submit the form
router.post("/partnership-request", verifyUserAuth, handlePartnershipInquiry);

// 2. CHECK STATUS (This was missing!)
// This route is what your Frontend calls on page load
router.get("/my-partnership-status", verifyUserAuth, getMyInquiryStatus);

/** * LEVEL 2: ADMIN ACCESS
 * Restricted to Admins only
 */
router.get(
  "/admin/partnerships",
  verifyUserAuth,
  roleBasedAccess("admin"),
  getAllInquiries
);

router.patch(
  "/admin/partnership/:id/status",
  verifyUserAuth,
  roleBasedAccess("admin"),
  updateInquiryStatus
);

export default router;
