import express from "express";
import {
  createProducts,
  createReviewForProduct,
  deleteProduct,
  deleteReview,
  getAdminAllProducts,
  getAllProducts,
  getAllReviews,
  getAllReviewsAdmin,
  getFeaturedReviews,
  getInventoryStats,
  getProductReviews,
  getSingleProduct,
  updateProduct,
  updateReviewStatus,
} from "../controllers/productController.js";

import { verifyUserAuth, roleBasedAccess } from "../middlewares/userAuth.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();


// 1. SPECIFIC PUBLIC ROUTES FIRST
router.get("/reviews/featured", getFeaturedReviews); // Specific path
router.get("/reviews", getProductReviews); // General path
router.get("/products", getAllProducts);
router.route("/reviews/all").get(getAllReviews);

// 2. AUTHENTICATED USER ACTIONS
router.put("/review", verifyUserAuth, createReviewForProduct);

// 3. SPECIFIC ADMIN ROUTES FIRST
// Move stats above /product/:id to prevent "admin" being treated as an ":id"
router.get(
  "/admin/inventory/stats",
  verifyUserAuth,
  roleBasedAccess("admin"),
  getInventoryStats
);

router
  .route("/admin/reviews")
  .get(verifyUserAuth, roleBasedAccess("admin"), getAllReviewsAdmin);

// 4. PARAMETERIZED ROUTES LAST
router.get("/product/:id", getSingleProduct);

// --- ADMIN CRUD ---
router.get(
  "/admin/products",
  verifyUserAuth,
  roleBasedAccess("admin"),
  getAdminAllProducts
);

router.post(
  "/admin/products",
  verifyUserAuth,
  roleBasedAccess("admin"),
  upload.array("images", 5),
  createProducts
);

router.put(
  "/admin/product/:id",
  verifyUserAuth,
  roleBasedAccess("admin"),
  upload.array("images", 3),
  updateProduct
);

router.delete(
  "/admin/product/:id",
  verifyUserAuth,
  roleBasedAccess("admin"),
  deleteProduct
);
router.delete("/admin/review", verifyUserAuth, deleteReview);

router.put(
  "/admin/review/status",
  verifyUserAuth,
  roleBasedAccess("admin"),
  updateReviewStatus
);

export default router;
