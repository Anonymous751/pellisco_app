import mongoose from "mongoose";

const StorefrontSchema = new mongoose.Schema(
  {
    // Changed to String to accommodate both auto-generated IDs and custom slot mapping
    slotId: {
      type: String,
      required: [true, "Slot ID is required for layout positioning"],
      index: true
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Hero",
          "SkinCare",
          "HairCare",
          "Treatments",
          "Shop by Concern",
          "The Essentials",
        ],
        message: "{VALUE} is not a supported storefront category",
      },
    },

    announcement: { // Specific field for marquee text
    type: String,
    trim: true,
    default: ""
  },
  isActive: { // Show/Hide toggle
    type: Boolean,
    default: true
  },

    // --- UPDATED: title and subtitle are now Arrays for multiple transitions ---
    title: {
      type: [String], // Changed from String to Array
      default: [],
    },
    subtitle: {
      type: [String], // Changed from String to Array
      default: [],
    },
    // --------------------------------------------------------------------------

    // This should store a permanent URL (Cloudinary/S3), not a blob: URL
    image: {
      type: String,
      required: [true, "An image URL is required for storefront slots"],
    },
    cta: {
      type: String,
      trim: true,

    },
    link: {
      type: String,
      trim: true,
      default: "#",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    // Ensures that when converted to JSON, virtuals and IDs are handled cleanly
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexing for faster queries when fetching specific sections like "Hero"
StorefrontSchema.index({ category: 1, slotId: 1 });

const Storefront = mongoose.model("Storefront", StorefrontSchema);

export default Storefront;
