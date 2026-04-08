import mongoose from "mongoose";

const shippingSchema = new mongoose.Schema({
  // 1. RELATIONS & CORE IDENTIFIERS
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: [true, "Shipment must be linked to an Order ID"],
    index: true // Fast lookup for Order History
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Shipment must be linked to a User"],
    index: true
  },
  shipmentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    default: () => `SHP-${Math.floor(100000 + Math.random() * 900000)}` // 6-digit for scale
  },

  // 2. LOGISTICS DETAILS
  carrier: {
    type: String,
    required: [true, "Carrier is required"],
    enum: {
      values: ["DHL Express", "FedEx", "GIG Logistics", "Local Courier", "UPS", "Standard Mail"],
      message: "{VALUE} is not a supported Pellisco carrier"
    }
  },
  shippingMethod: {
    type: String,
    required: [true, "Shipping method is required (e.g., Air, Sea, Surface)"],
    trim: true
  },
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true, // Allows null for pending shipments, but unique if present
    trim: true,
    index: true
  },

  // 3. DESTINATION DATA (Structured for Global Shipping)
  destination: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true, minlength: 2, maxlength: 10 }, // ISO Code (NG, UK, US, )
    zipCode: { type: String, required: true },
    phone: { type: String, required: true }
  },

  // 4. STATUS & TIMELINE
 status: {
    type: String,
    required: true,
    enum: [
      "Pending",
      "Processing",
      "Confirmed",         // Added
      "Packed",            // Added
      "Shipped",           // Added
      "In Transit",
      "Out for Delivery",
      "Delivered",
      "Delayed",
      "Returned",
      "Cancelled"
    ],
    default: "Pending",
    index: true
},
  eta: {
    type: Date,
    required: [true, "Estimated Arrival Date is required"]
  },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },

  // 5. FINANCIALS
  shippingCost: {
    amount: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      required: true,
      enum: ["NGN", "USD", "GBP", "EUR", "INR", "CAD"],
      default: "NGN"
    }
  },

  // 6. AUDIT LOGS (Immutable History)
  logs: [{
    status: { type: String, required: true },
    location: { type: String },
    timestamp: { type: Date, default: Date.now },
    message: { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // ID of Admin who updated it
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/* =======================================
   MIDDLEWARE: STOCK LOGIC & TIMESTAMPS
======================================= */

// 1. Pre-save: Handle Timestamps & Auto-Logging
shippingSchema.pre('save', function() {
  if (this.isModified('status')) {
    // FIX: Match the enum "In Transit" instead of "Shipped"
    if (this.status === 'In Transit' && !this.shippedAt) {
      this.shippedAt = Date.now();
    }
    if (this.status === 'Delivered' && !this.deliveredAt) {
      this.deliveredAt = Date.now();
    }

    // Auto-create an Audit Log entry so the "Logs" array is always current
    this.logs.push({
      status: this.status,
      message: `System updated status to ${this.status}`,
      timestamp: Date.now()
    });
  }
});

// 2. Post-save: The "Stock Bridge"
shippingSchema.post('save', async function(doc) {
  // Only trigger if status is Delivered and order is not null
  if (doc.status === 'Delivered' && doc.order) {
    try {
      const shipment = await doc.populate('order');

      if (shipment.order && shipment.order.orderItems) {
        const updatePromises = shipment.order.orderItems.map(item => {
          return Product.findByIdAndUpdate(item.product, {
            $inc: {
              stock: -item.quantity,        // Physically removed from warehouse
              reservedStock: -item.quantity  // Removing the temporary hold
            }
          });
        });

        await Promise.all(updatePromises);
        console.log(`Pellisco Inventory Synced: ${doc.shipmentId}`);
      }
    } catch (error) {
      console.error(`Inventory Sync Failed for ${doc.shipmentId}:`, error.message);
    }
  }
});

// Indexes
shippingSchema.index({ status: 1, createdAt: -1 });
shippingSchema.index({ "destination.country": 1 });

export default mongoose.model("Shipping", shippingSchema);
