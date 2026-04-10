import express from "express";
import {
  subscribeUser,
  unsubscribeUser,
  getAllSubscribers,
  deleteSubscriber,
} from "../controllers/subscriberController.js";

import { verifyUserAuth, roleBasedAccess } from "../middlewares/userAuth.js";

const router = express.Router();

// PUBLIC
router.post("/subscribe", subscribeUser);
router.post("/unsubscribe", unsubscribeUser);

// ADMIN
router.get(
  "/admin/subscribers",
  verifyUserAuth,
  roleBasedAccess("admin"),
  getAllSubscribers
);

router.delete(
  "/admin/subscriber/:id",
  verifyUserAuth,
  roleBasedAccess("admin"),
  deleteSubscriber
);

export default router;


// POST   /subscribe
// POST   /unsubscribe

// GET    /admin/subscribers
// DELETE /admin/subscriber/:id
