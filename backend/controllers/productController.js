import { v2 as cloudinary } from 'cloudinary';
import handleAsyncError from "../middlewares/handleAsyncError.js";
import Product from "../models/productModel.js";
import APIFunctionality from "../utils/apiFunctionality.js";
import HandleError from "../utils/handleError.js";
import mongoose from "mongoose";
import redisClient from "../config/redis.js"; // Import your centralized redis client

// --- HELPER: CACHE INVALIDATION ---
const clearProductCache = async () => {
  try {
    const keys = await redisClient.keys("products:*");
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🧹 Redis: Cleared ${keys.length} cache keys`);
    }
  } catch (err) {
    console.error("❌ Redis Cache Error:", err);
  }
};

// Create Products
export const createProducts = handleAsyncError(async (req, res, next) => {
  const imagesLinks = [];

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const fileBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      const result = await cloudinary.uploader.upload(fileBase64, {
        folder: "pellisco/products",
        width: 1000,
        crop: "scale"
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  }

  const productData = {
    ...req.body,
    user: req.user.id,
    images: imagesLinks,
    price: typeof req.body.price === 'string' ? JSON.parse(req.body.price) : req.body.price,
    dimensions: typeof req.body.dimensions === 'string' ? JSON.parse(req.body.dimensions) : req.body.dimensions,
    stock: Number(req.body.stock),
    weight: Number(req.body.weight),
  };

  const product = await Product.create(productData);

  // Invalidate Cache
  await clearProductCache();

  res.status(201).json({
    success: true,
    message: "Ritual Product Created!",
    product,
  });
});

// GET all Products
export const getAllProducts = handleAsyncError(async (req, res, next) => {
  const resultPerPage = 6;
  const page = Number(req.query.page) || 1;

  // 1. Generate Cache Key based on query params
  const cacheKey = `products:all:page:${page}:query:${JSON.stringify(req.query)}`;

  // 2. Try to fetch from Redis
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    console.log("⚡ Redis: Serving All Products from Cache");
    return res.status(200).json(JSON.parse(cachedData));
  }

  // 3. MongoDB Fallback
  const apiFeatures = new APIFunctionality(Product.find(), req.query)
    .search("name", "sku")
    .filter()
    .sort();

  const filteredQuery = apiFeatures.query.clone();
  const productCount = await filteredQuery.countDocuments();
  const totalPages = Math.ceil(productCount / resultPerPage);

  if (page > totalPages && productCount > 0) {
    return next(new HandleError("This Page does not Exist", 404));
  }

  apiFeatures.pagination(resultPerPage);
  const products = await apiFeatures.query;

  const response = {
    success: true,
    products,
    resultPerPage,
    productCount,
    totalPages,
    currentPage: page
  };

  // 4. Set Cache (Expire in 2 hours)
  await redisClient.setEx(cacheKey, 7200, JSON.stringify(response));

  res.status(200).json(response);
});

export const updateProduct = handleAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) return next(new HandleError("Ritual Not Found", 404));

  const fields = ["name", "description", "category", "stock", "product_sku"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  if (req.body.mrp !== undefined || req.body.sale !== undefined) {
    product.price = {
      mrp: req.body.mrp ? Number(req.body.mrp) : product.price.mrp,
      sale: req.body.sale ? Number(req.body.sale) : product.price.sale,
      offer: product.price.offer || ""
    };
    product.markModified('price');
  }

  if (req.files && req.files.length > 0) {
    try {
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
        }
      }

      const imagesLinks = [];
      for (const file of req.files) {
        let fileStream = file.path ? file.path : `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

        const result = await cloudinary.uploader.upload(fileStream, {
          folder: "pellisco_products",
          resource_type: "auto"
        });

        imagesLinks.push({ public_id: result.public_id, url: result.secure_url });
      }
      product.images = imagesLinks;
      product.markModified('images');
    } catch (err) {
      return next(new HandleError(`Upload Failed: ${err.message}`, 500));
    }
  }

  await product.save();

  // Invalidate Cache for this specific product and list
  await redisClient.del(`products:single:${req.params.id}`);
  await clearProductCache();

  res.status(200).json({
    success: true,
    message: "Ritual updated successfully",
    product,
  });
});

// Delete Product
export const deleteProduct = handleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new HandleError("Ritual Not Found", 404));

  if (product.images && product.images.length > 0) {
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.uploader.destroy(product.images[i].public_id);
    }
  }

  await product.deleteOne();

  // Invalidate Cache
  await redisClient.del(`products:single:${req.params.id}`);
  await clearProductCache();

  res.status(200).json({
    success: true,
    message: "Ritual deleted successfully",
  });
});

// Access Single Product
export const getSingleProduct = handleAsyncError(async (req, res, next) => {
  const cacheKey = `products:single:${req.params.id}`;

  // 1. Check Redis
  const cachedProduct = await redisClient.get(cacheKey);
  if (cachedProduct) {
    console.log(`⚡ Redis: Serving Single Product [${req.params.id}]`);
    return res.status(200).json({ success: true, product: JSON.parse(cachedProduct) });
  }

  // 2. MongoDB Fallback
  const product = await Product.findById(req.params.id);
  if (!product) return next(new HandleError("Product Not Found", 404));

  // 3. Save to Redis
  await redisClient.setEx(cacheKey, 7200, JSON.stringify(product));

  res.status(200).json({
    success: true,
    product
  });
});



// --- Admin Controllers (No Caching for live accuracy) ---

export const getAdminAllProducts = handleAsyncError(async (req, res, next) => {
  const { keyword, page = 1 } = req.query;
  const resPerPage = 10;
  const skip = (Math.max(1, Number(page)) - 1) * resPerPage;

  const upperKey = keyword ? keyword.toUpperCase() : "";
  const cleanKey = upperKey.replace(/^PELL-/, "");

  let searchFilter = {};
  if (keyword) {
    searchFilter = {
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { product_sku: { $regex: upperKey, $options: "i" } },
        { product_sku: { $regex: cleanKey, $options: "i" } }
      ]
    };
  }

  const results = await Product.aggregate([
    { $match: searchFilter },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: resPerPage }]
      }
    }
  ]);

  const productCount = results[0]?.metadata[0]?.total || 0;
  const products = results[0]?.data || [];
  const totalPages = Math.ceil(productCount / resPerPage);

  res.status(200).json({
    success: true,
    products,
    productCount,
    totalPages,
    currentPage: Number(page)
  });
});

export const getInventoryStats = handleAsyncError(async (req, res, next) => {
  const totalProducts = await Product.countDocuments();
  const lowStockCount = await Product.countDocuments({ stock: { $lte: 10, $gt: 0 } });
  const outOfStockCount = await Product.countDocuments({ stock: 0 });

  const inventoryValue = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalValue: {
          $sum: {
            $multiply: [
              { $toDouble: { $ifNull: ["$price.sale", 0] } },
              { $toDouble: { $ifNull: ["$stock", 0] } }
            ]
          }
        }
      }
    }
  ]);

  const totalValue = inventoryValue.length > 0 ? inventoryValue[0].totalValue : 0;

  res.status(200).json({
    success: true,
    stats: {
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalValue: Math.round(totalValue)
    }
  });
});


// ===============================================================
//  Product Reviews /////////////////////////
// ==============================================================

/**
 * @description Create or Update Product Review with Redis Cache Invalidation
 * @route PUT /api/v1/review
 */
export const createReviewForProduct = handleAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  // 1. Validation
  if (!productId) {
    return next(new HandleError("Product ID is required", 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new HandleError("Product Not Found", 404));
  }

  // 2. Check if user already reviewed this product
  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  // Define the review data (Extracting avatar.url from your User object)
  const reviewData = {
    user: req.user._id,
    name: req.user.name,
    avatar: req.user.avatar?.url || "", // Maps the Cloudinary URL correctly
    rating: Number(rating),
    comment,
    status: "pending", // Reset to pending for Admin review
  };

  if (isReviewed) {
    // Update existing review (Flipkart Style)
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = reviewData.rating;
        rev.comment = reviewData.comment;
        rev.avatar = reviewData.avatar; // Update avatar in case user changed it
        rev.status = "pending";
      }
    });
  } else {
    // Add new review
    product.reviews.push(reviewData);
  }

  // 3. Recalculate Average Rating (ONLY including 'approved' reviews)
  // This ensures your product rating stays honest and verified
  const approvedReviews = product.reviews.filter((rev) => rev.status === "approved");

  product.numOfReviews = approvedReviews.length;

  if (approvedReviews.length > 0) {
    const totalRating = approvedReviews.reduce((acc, rev) => acc + rev.rating, 0);
    product.ratings = totalRating / approvedReviews.length;
  } else {
    product.ratings = 0;
  }

  // 4. Save to MongoDB
  await product.save({ validateBeforeSave: false });

  // 5. REDIS CACHE INVALIDATION
  try {
    const productCacheKey = `products:single:${productId}`;

    // Delete specific product cache so users see the "Pending" status or new stats
    await redisClient.del(productCacheKey);

    // Clear general product list caches (where ratings are displayed)
    if (typeof clearProductCache === "function") {
      await clearProductCache();
    }

    console.log(`Cache invalidated for Product: ${productId}`);
  } catch (cacheError) {
    console.error("Redis Cache Invalidation Error:", cacheError);
  }

  // 6. Response
  res.status(200).json({
    success: true,
    message: isReviewed
      ? "Review updated and sent for admin approval"
      : "Review submitted successfully for admin approval",
  });
});

export const getProductReviews = handleAsyncError(async (req, res, next) => {
  const productId = req.query.id?.trim();

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return next(new HandleError("Valid Product ID is required", 400));
  }

  const product = await Product.findById(productId);
  if (!product) return next(new HandleError("No product found with this ID", 404));

  res.status(200).json({
    success: true,
    reviews: product.reviews || []
  });
});


// Get All Reviews (Admin) - Gather reviews from all products
export const getAllReviewsAdmin = handleAsyncError(async (req, res, next) => {
  const products = await Product.find();

  let allReviews = [];

  products.forEach((product) => {
    if (product.reviews && product.reviews.length > 0) {
      product.reviews.forEach((rev) => {
        allReviews.push({
          _id: rev._id,
          name: rev.name,
          avatar: rev.avatar,
          rating: rev.rating,
          comment: rev.comment,
          status: rev.status || "pending",
          productId: product._id,
          productName: product.name,
          createdAt: rev.createdAt
        });
      });
    }
  });

  // Sort by newest first
  allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.status(200).json({
    success: true,
    reviews: allReviews,
  });
});

// Admin Update Review Status
// Admin Update Review Status
export const updateReviewStatus = handleAsyncError(async (req, res, next) => {
  const { productId, reviewId, status } = req.body;

  if (!["approved", "rejected", "pending"].includes(status)) {
    return next(new HandleError("Invalid status value", 400));
  }

  // 1️⃣ Fetch the product
  const product = await Product.findById(productId);
  if (!product) return next(new HandleError("Product not found", 404));

  // 2️⃣ Find the review
  const review = product.reviews.id(reviewId);
  if (!review) return next(new HandleError("Review not found", 404));

  // 3️⃣ Update review status
  review.status = status;

  // 4️⃣ Recalculate ratings (only approved reviews count)
  const ADMIN_USER_ID = "69af9b5f0cac50719bc75a3a"; // Exclude admin reviews
  const approvedReviews = product.reviews.filter(
    rev => rev.status === "approved" && rev.user.toString() !== ADMIN_USER_ID
  );

  product.numOfReviews = approvedReviews.length;
  product.ratings =
    approvedReviews.length > 0
      ? approvedReviews.reduce((acc, rev) => acc + rev.rating, 0) / approvedReviews.length
      : 0;

  // 5️⃣ Save the updated product
  await product.save({ validateBeforeSave: false });

  // 6️⃣ Invalidate Redis cache so frontend sees changes immediately
  try {
    const productCacheKey = `products:single:${productId}`;
    await redisClient.del(productCacheKey);

    if (typeof clearProductCache === "function") {
      await clearProductCache();
    }

    console.log(`Review updated: Cache cleared for product ${productId}`);
  } catch (err) {
    console.error("Redis error during review update:", err);
  }

  // 7️⃣ Respond to client
  res.status(200).json({
    success: true,
    message:
      status === "approved"
        ? "Review approved successfully"
        : status === "rejected"
        ? "Review rejected successfully"
        : "Review status updated to pending",
    review: {
      _id: review._id,
      status: review.status,
    },
    productRatings: {
      ratings: product.ratings,
      numOfReviews: product.numOfReviews,
    },
  });
});

export const deleteReview = handleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  if (!product) return next(new HandleError("Product Not Found", 400));

  const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString());
  const numOfReviews = reviews.length;
  let sum = 0;
  reviews.forEach(rev => sum += rev.rating);
  const ratings = reviews.length > 0 ? sum / reviews.length : 0;

  await Product.findByIdAndUpdate(req.query.productId, {
    reviews,
    numOfReviews,
    ratings
  }, { new: true, runValidators: true });

  // Invalidate Cache
  await redisClient.del(`products:single:${req.query.productId}`);
  await clearProductCache();

  res.status(200).json({
    success: true,
    message: "Review Deleted Successfully ...!"
  });
});

export const getFeaturedReviews = handleAsyncError(async (req, res) => {
  const ADMIN_USER_ID = "69af9b5f0cac50719bc75a3a";

  const products = await Product.find({
    "reviews.status": "approved",
    "reviews.rating": { $gte: 4 },
  }).select("reviews name images");

  const featuredReviews = products.flatMap(p =>
    p.reviews
      .filter(r => r.status === "approved" && r.rating >= 4 && r.user.toString() !== ADMIN_USER_ID)
      .map(rev => ({
        ...rev.toObject(),
        productName: p.name,
        productImage: p.images[0]?.url
      }))
  );

  res.status(200).json({
    success: true,
    reviews: featuredReviews
  });
});

// Get All Reviews (Global)
// Get All Reviews Globally (Rating >= 2)
// In productController.js
// In productController.js
export const getAllReviews = handleAsyncError(async (req, res, next) => {
  const products = await Product.find();

  const ADMIN_USER_ID = "69af9b5f0cac50719bc75a3a";

  const allReviews = products.flatMap((product) => {
    const reviews = Array.isArray(product.reviews) ? product.reviews : [];
    return reviews
      .filter((rev) => rev && rev.user) // skip null or invalid review
      .map((rev) => {
        const reviewObj = rev.toObject ? rev.toObject() : rev;
        return {
          ...reviewObj,
          productName: product.name || "Unknown Product",
          productId: product._id,
        };
      });
  });

  // Exclude admin reviews, keep everything else
  const filteredReviews = allReviews.filter(
    (rev) => rev.user.toString() !== ADMIN_USER_ID
  );

  res.status(200).json({
    success: true,
    count: filteredReviews.length,
    reviews: filteredReviews,
  });
});
