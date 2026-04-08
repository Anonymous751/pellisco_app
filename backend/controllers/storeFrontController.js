import Storefront from "../models/storeFrontModel.js";
import mongoose from "mongoose";
import { createClient } from "redis";

// 1. Initialize Redis Client with Authentication
const redisClient = createClient({
  password: "pellisco123", // <--- Your new password goes here
  socket: {
    host: "127.0.0.1",
    port: 6379,
  },
});

redisClient.on("error", (err) => console.log("❌ Redis Client Error", err));

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    console.log("✅ Redis Connected for Pellisco Cache");
  } catch (err) {
    console.log(
      "⚠️ Redis Connection Failed. Check your password in the controller."
    );
  }
})();
// Helper to generate consistent cache keys
const GET_CACHE_KEY = (category) => `storefront:category:${category}`;

// @desc    Deploy all storefront tabs from Pellisco Studio
// @route   POST /api/storefront/deploy-all
export const deployAllTabs = async (req, res) => {
  try {
    const { contentData } = req.body;

    if (!contentData) {
      console.log("❌ Deploy Failed: No contentData in request body");
      return res
        .status(400)
        .json({ success: false, message: "No data provided" });
    }

    console.log("--- 🚀 STARTING DEPLOYMENT ---");
    console.log("Received Categories:", Object.keys(contentData));

    // 1. Prepare the data (No changes to your mapping logic)
    const allSlots = Object.entries(contentData).flatMap(([category, slots]) =>
      slots.map((slot) => {
        console.log(
          `Mapping [${category}] Slot: ${slot.id} | CTA: "${slot.cta}" | Active: ${slot.isActive}`
        );
        return {
          slotId: slot.id,
          category,
          title: slot.title || "",
          subtitle: slot.subtitle || "",
          announcement: slot.announcement || "",
          image: slot.image || null,
          cta: slot.cta,
          link: slot.link || "",
          isActive: slot.isActive !== undefined ? slot.isActive : true,
        };
      })
    );

    // 2. Prepare Bulk Operations (Upsert logic)
    const bulkOps = allSlots.map((slot) => ({
      updateOne: {
        filter: { slotId: slot.slotId, category: slot.category },
        update: { $set: slot },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      const result = await Storefront.bulkWrite(bulkOps);
      console.log(
        `✅ BulkWrite Complete: ${result.upsertedCount} new, ${result.modifiedCount} updated`
      );
    }

    // 3. Sync Logic: Cleanup slots removed from Studio
    const activeSlotIds = allSlots.map((s) => s.slotId);
    const deleteResult = await Storefront.deleteMany({
      slotId: { $nin: activeSlotIds },
      category: { $in: Object.keys(contentData) },
    });
    console.log(
      `🧹 Cleanup: Removed ${deleteResult.deletedCount} inactive slots`
    );

    // --- 🚀 NEW: REDIS CACHE INVALIDATION ---
    // Clear the cache for every category we just updated so users see fresh data
    const updatedCategories = Object.keys(contentData);
    const clearTasks = updatedCategories.map((cat) =>
      redisClient.del(GET_CACHE_KEY(cat))
    );
    await Promise.all(clearTasks);
    console.log(
      `✨ Redis: Cache cleared for categories: ${updatedCategories.join(", ")}`
    );

    console.log("--- ✅ DEPLOYMENT SUCCESSFUL ---");

    res.status(200).json({
      success: true,
      message: "Pellisco Storefront Live and Persistent!",
      count: allSlots.length,
    });
  } catch (err) {
    console.error("❌ DEPLOY ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Fetch specific category for components (HeroSlider, etc.)
// @route   GET /api/storefront/:category
// @desc    Fetch specific category for components (HeroSlider, etc.)
export const getSlotsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const cacheKey = GET_CACHE_KEY(category);

    // 1. Try to fetch from Redis
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`⚡ Redis: Serving [${category}]`);
      // Standardize the response structure
      return res.status(200).json({
        success: true,
        slots: JSON.parse(cachedData)
      });
    }

    // 2. MongoDB Fetch
    const slots = await Storefront.find({ category }).sort({ slotId: 1 });

    // 3. Update Cache
    if (slots.length > 0) {
      await redisClient.set(cacheKey, JSON.stringify(slots));
    }

    // Standardize the response structure
    res.status(200).json({
      success: true,
      slots: slots
    });

  } catch (err) {
    console.error("❌ Storefront Fetch Error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error fetching storefront data"
    });
  }
};
