import mongoose from "mongoose";

// IMAGE SUB SCHEMA
const imageSchema = new mongoose.Schema(
  {
    public_id: {
      type: String,
      required: [true, "Image public_id is required"],
      trim: true
    },
    url: {
      type: String,
      required: [true, "Image url is required"],
      trim: true
    }
  },
  { _id: false }
);

// VARIANT SUB SCHEMA
const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      trim: true,
      maxlength: [50, "Size value too long"]
    },
    color: {
      type: String,
      trim: true,
      maxlength: [50, "Color value too long"]
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Variant stock cannot be negative"]
    },
    product_varient_sku: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [100, "SKU too long"]
    }
  },
  { _id: false }
);

// REVIEW SUB SCHEMA
  const reviewSchema = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
      },
      name: {
        type: String,
        trim: true,
        maxlength: [100, "Name too long"]
      },
      avatar: {
      type: String, // Stores the Cloudinary secure_url
      default: ""
    },
      rating: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"]
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [2000, "Comment too long"]
      },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending" // All new reviews start as pending
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    },
    { _id: true }
  );

// MAIN PRODUCT SCHEMA
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Product Name"],
    trim: true,
    maxlength: [200, "Product name cannot exceed 200 characters"],
    index: true
  },

  brand: {
    type: String,
    trim: true,
    maxlength: [120, "Brand name too long"]
  },

  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  product_sku: {
    type: String,
    required: [true, "Please Enter Product SKU"],
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },

  description: {
    type: String,
    required: [true, "Please Enter Product Description"],
    maxlength: [5000, "Description too long"]
  },

  // --- CATEGORY IMPROVEMENTS ---

  // NEW: Handles the Top Navbar Tabs (Skin Care, Hair Care, Treatments)
  mainCategory: {
    type: String,
    required: [true, "Please Enter Main Category (e.g., skin-care)"],
    trim: true,
    lowercase: true,
    index: true
  },

  // Handles Sub-items (Cleanser, Toner, Shampoo, etc.)
  category: {
    type: String,
    required: [true, "Please Enter Product Category"],
    trim: true,
    lowercase: true,
    index: true
  },

  // Tags for "Shop" tab filters like 'travel-size', 'gift-sets', 'best-seller'
  tags: [
    {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [80, "Tag too long"]
    }
  ],

  // --- PRICING ---
  price: {
    mrp: {
      type: Number,
      required: [true, "Enter Product MRP"],
      min: [0, "MRP cannot be negative"],
      max: [9999999, "Price cannot exceed 7 digits"]
    },
    sale: {
      type: Number,
      required: [true, "Enter Sale Price"],
      min: [0, "Sale price cannot be negative"],
      validate: {
        validator: function (value) {
          return value <= this.price.mrp;
        },
        message: "Sale price cannot be greater than MRP"
      }
    },
    // Fixed: Moved outside of 'sale' field but still inside 'price'
    offer: {
      type: String,
      trim: true,
      maxlength: [100, "Offer text too long"],
      default: ""
    }
  },

  variants: {
    type: [variantSchema],
    default: []
  },

  stock: {
    type: Number,
    required: [true, "Please Enter Product Stock"],
    default: 0,
    min: [0, "Stock cannot be negative"]
  },

  weight: {
    type: Number,
    min: [0, "Weight cannot be negative"]
  },

  dimensions: {
    length: { type: Number, min: [0, "Length cannot be negative"] },
    width: { type: Number, min: [0, "Width cannot be negative"] },
    height: { type: Number, min: [0, "Height cannot be negative"] }
  },

  images: {
    type: [imageSchema],
    validate: {
      validator: function (arr) {
        return arr.length > 0;
      },
      message: "At least one product image is required"
    }
  },

  ingredients: {
    type: String,
    trim: true,
    maxlength: [3000, "Ingredients text too long"]
  },

  usage: {
    type: String,
    trim: true,
    maxlength: [3000, "Usage text too long"]
  },

  ratings: {
    type: Number,
    default: 0,
    min: [0, "Rating cannot be negative"],
    max: [5, "Rating cannot exceed 5"],
    index: true
  },

  numOfReviews: {
    type: Number,
    default: 0,
    min: [0, "Review count cannot be negative"]
  },

  reviews: {
    type: [reviewSchema],
    default: []
  },

  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },

  status: {
    type: String,
    enum: ["available", "sold_out", "out_of_stock"],
    default: "available",
    index: true
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: -1
  },

  updatedAt: {
    type: Date
  }
});

// Middleware to update the updatedAt field
productSchema.pre('save', function() {
  this.updatedAt = Date.now();

});

export default mongoose.model("Product", productSchema);
