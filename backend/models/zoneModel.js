import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema({
  // 1. IDENTIFICATION
  zoneName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    enum: {
      values: ["Local", "Regional", "National", "Special State"],
      message: "{VALUE} is not a valid Indian Logistics Zone"
    }
  },

  // 2. GEOGRAPHIC SCOPE (Pincode-level precision is industry standard)
  applicableStates: [{
    type: String,
    uppercase: true,
    trim: true
  }],
  restrictedPincodes: [String], // Blacklisted areas (e.g., containment zones or non-serviceable)

  // 3. WEIGHT & PRICING ARCHITECTURE (Slab Logic)
  pricingStructure: {
    baseWeight: {
      type: Number,
      default: 500,
      help: "Weight in grams for the initial charge"
    },
    baseCost: {
      type: Number,
      required: [true, "Base shipping cost is required"],
      min: 0
    },
    incrementalWeightUnit: {
      type: Number,
      default: 500,
      help: "Weight unit for additional charges (e.g., every 500g extra)"
    },
    incrementalCost: {
      type: Number,
      required: true,
      min: 0
    }
  },

  // 4. LOGISTICS CONTROLS
  serviceability: {
    isCODAvailable: { type: Boolean, default: true },
    maxWeightLimit: { type: Number, default: 20000 }, // 20kg limit for standard shipping
    isActive: { type: Boolean, default: true }
  },

  // 5. TIMELINE & SURCHARGES
  deliveryMetrics: {
    minDays: { type: Number, required: true },
    maxDays: { type: Number, required: true },
    fuelSurchargePercentage: { type: Number, default: 0 } // Industry standard for dynamic fuel costs
  },

  // 6. ADMIN AUDIT
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/* =======================================
   INDEXING FOR SPEED
======================================= */
// Fast lookup when checking if a state is in a zone
zoneSchema.index({ applicableStates: 1, "serviceability.isActive": 1 });

/* =======================================
   VIRTUALS (Calculated Fields)
======================================= */
// Example: Display a human-readable delivery range
zoneSchema.virtual('deliveryWindow').get(function() {
  return `${this.deliveryMetrics.minDays}-${this.deliveryMetrics.maxDays} Business Days`;
});

export default mongoose.model("Zone", zoneSchema);
