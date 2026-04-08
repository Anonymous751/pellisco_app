import express from "express";
import {
  calculateShippingCost,
  upsertZone,
  getAllZones
} from "../controllers/zoneController.js";
import { verifyUserAuth, roleBasedAccess } from "../middlewares/userAuth.js";

const router = express.Router();


/**
 * @route   POST /api/v1/zones/calculate
 * @desc    Public route for Checkout page to get live shipping rates
 * @access  Public (or Logged-in User)
 */
router.post("/calculate", calculateShippingCost);

/* ==========================================================================
   ADMIN LOGISTICS MANAGEMENT (Protected)
   ========================================================================== */

// Apply middleware to all routes below this line
router.use(verifyUserAuth);
router.use(roleBasedAccess("admin"));

/**
 * @route   GET /api/v1/zones
 * @desc    Fetch all configured shipping zones for the Admin Panel
 */
/**
 * @route   POST /api/v1/zones
 * @desc    Create or update a zone configuration
 */
router.route("/")
  .get(getAllZones)
  .post(upsertZone);

export default router;
