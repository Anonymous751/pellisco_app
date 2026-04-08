import Zone from "../models/zoneModel.js";
import handleAsyncError from "../middlewares/handleAsyncError.js";
import HandleError from "../utils/handleError.js";

/**
 * @desc    Calculate Shipping Cost based on Weight and Pincode
 * @route   POST /api/v1/shipping/calculate-cost
 */
export const calculateShippingCost = handleAsyncError(async (req, res, next) => {
  const { state, pincode, totalWeightInGrams } = req.body;

  // 1. Find the applicable zone for the customer's state
  const zone = await Zone.findOne({
    applicableStates: state.toUpperCase(),
    serviceability: { isActive: true }
  });

  if (!zone) {
    return next(new HandleError("Shipping not available for this state yet", 404));
  }

  // 2. Check Pincode Restrictions
  if (zone.restrictedPincodes.includes(pincode)) {
    return next(new HandleError("Delivery to this specific area is currently suspended", 400));
  }

  // 3. APPLY SLAB LOGIC (Industry Standard Calculation)
  const { baseWeight, baseCost, incrementalWeightUnit, incrementalCost } = zone.pricingStructure;
  let finalCost = baseCost;

  if (totalWeightInGrams > baseWeight) {
    const extraWeight = totalWeightInGrams - baseWeight;
    const extraSlabs = Math.ceil(extraWeight / incrementalWeightUnit);
    finalCost += (extraSlabs * incrementalCost);
  }

  // 4. Apply Fuel Surcharge if any
  const surcharge = (finalCost * zone.deliveryMetrics.fuelSurchargePercentage) / 100;
  finalCost += surcharge;

  res.status(200).json({
    success: true,
    data: {
      zoneName: zone.zoneName,
      estimatedDelivery: zone.deliveryWindow,
      shippingFee: Math.round(finalCost),
      isCODAvailable: zone.serviceability.isCODAvailable
    }
  });
});

/**
 * @desc    Create or Update a Zone (Admin)
 * @route   POST /api/v1/admin/zones
 */
export const upsertZone = handleAsyncError(async (req, res, next) => {
  const { zoneName } = req.body;

  const zone = await Zone.findOneAndUpdate(
    { zoneName },
    { ...req.body, lastUpdatedBy: req.user._id },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(201).json({
    success: true,
    message: "Shipping zone configuration updated successfully",
    zone
  });
});

/**
 * @desc    Get All Zones for Admin Settings
 * @route   GET /api/v1/admin/zones
 */
export const getAllZones = handleAsyncError(async (req, res) => {
  const zones = await Zone.find().sort({ "pricingStructure.baseCost": 1 });

  res.status(200).json({
    success: true,
    count: zones.length,
    zones
  });
});
