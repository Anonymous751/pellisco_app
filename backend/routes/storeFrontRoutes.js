import express from "express";
const router = express.Router();

// Controllers (Ensure the .js extension is there)


// Your existing Middlewares
import { roleBasedAccess, verifyUserAuth } from "../middlewares/userAuth.js";
import { deployAllTabs, getSlotsByCategory } from "../controllers/storeFrontController.js";

// Public: For the main website
router.get("/:category", getSlotsByCategory);

// Protected: For your Admin Studio
router.post(
  "/deploy-all",
  verifyUserAuth,
  roleBasedAccess("admin"),
  deployAllTabs
);

router.get("/redis-check", async (req, res) => {
  try {
    const ping = await redisClient.ping(); // Should return 'PONG'
    const keys = await redisClient.keys('storefront:*');
    res.json({ status: "Online", ping, activeCacheKeys: keys });
  } catch (err) {
    res.status(500).json({ status: "Offline", error: err.message });
  }
});

export default router;
