import express from "express";
import {
  getShippingStats,
  getAllShipments,
  createShipment,
  updateShippingStatus,
} from "../controllers/shippingController.js";
import { verifyUserAuth, roleBasedAccess } from "../middlewares/userAuth.js";

const router = express.Router();


/**
 * @description SECURE LOGISTICS GATEWAY
 * All logistics operations require an active session and Admin privileges.
 */
router.use(verifyUserAuth);
router.use(roleBasedAccess("admin"));

/* ==========================================================================
    1. ANALYTICS & DASHBOARD
    ========================================================================== */

// Feeds the 4 top cards (Active, Delivered, Revenue, etc.)
router.get("/shipping/stats", getShippingStats);

/* ==========================================================================
    2. SHIPMENT DIRECTORY (CRUD)
    ========================================================================== */

router
  .route("/shipping")
  /**
   * @access Admin
   * @desc   Get all shipments with support for ?keyword=, ?status=, and ?page=
   */
  .get(getAllShipments)

  /**
   * @access Admin
   * @desc   Initialize a new logistics record from an Order
   */
  .post(createShipment);

/* ==========================================================================
    3. SHIPMENT LIFECYCLE MANAGEMENT
    ========================================================================== */

/**
 * @access Admin
 * @desc   Update status (e.g., Pending -> In Transit) and add to Audit Logs
 * @note   Using PATCH as we are only updating specific fields of the shipment
 */
router.patch("/shipping/:id/status", updateShippingStatus);

export default router;
