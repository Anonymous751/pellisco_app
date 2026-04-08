import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "/api/v1/shipping";

/**
 * 1. Fetch Dashboard Analytics
 */
export const getShippingStats = createAsyncThunk(
  "shipping/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/stats`, { withCredentials: true });
      return data.stats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Analytics sync failed");
    }
  }
);

/**
 * 2. Fetch Shipment Directory
 */
export const getAllShipments = createAsyncThunk(
  "shipping/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { keyword = "", status = "", page = 1 } = params;
      const query = new URLSearchParams({ keyword, status, page }).toString();
      const { data } = await axios.get(`${API_URL}?${query}`, { withCredentials: true });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to retrieve directory");
    }
  }
);

/**
 * 3. Initialize Fulfillment
 * REWRITTEN WITH FAILSAFES: This ensures the backend never sees 'undefined' for mandatory fields.
 */
export const createShipment = createAsyncThunk(
  "shipping/create",
  async (formData, { rejectWithValue }) => {
    try {
      // 1. Ensure we spread the nested destination object to include all required fields
      const payload = {
        order: formData.order,
        user: formData.user,
        carrier: formData.carrier || "Local Courier",
        shippingMethod: formData.shippingMethod || "Surface",
        eta: formData.eta,
        // SPREAD the destination to catch address, city, state, country, zipCode, and phone
        destination: {
          ...formData.destination
        },
        shippingCost: formData.shippingCost || { amount: 0, currency: "NGN" }
      };

      // 2. STRENGTHENED VALIDATION
      const { address, city, state, country, zipCode, phone } = payload.destination;
      if (!payload.order || !payload.user || !address || !city || !state || !phone) {
        return rejectWithValue("Missing required shipping details.");
      }

      const { data } = await axios.post(API_URL, payload, { withCredentials: true });
      return data.shipment;
    } catch (error) {
      // Return the specific backend error message if available
      return rejectWithValue(error.response?.data?.message || "Fulfillment creation failed");
    }
  }
);

/**
 * 4. Update Status & Audit Logs
 */
export const updateShipmentStatus = createAsyncThunk(
  "shipping/updateStatus",
  async ({ id, ...updateData }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.patch(
        `${API_URL}/${id}/status`,
        updateData,
        { withCredentials: true }
      );
      // Auto-refresh stats so the UI stays in sync
      dispatch(getShippingStats());
      return data.shipment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Status sync failed");
    }
  }
);

const initialState = {
  shipments: [],
  stats: {
    activeShipments: 0,
    deliveredToday: 0,
    delayedAlerts: 0,
    successRate: 0,
    activeFleetValue: 0,
  },
  totalShipments: 0,
  pages: 1,
  loading: false,
  success: false,
  error: null,
};

const shippingSlice = createSlice({
  name: "shipping",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    resetShipmentStatus: (state) => {
      state.success = false;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      /* --- SUCCESS CASES --- */
      .addCase(getShippingStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getAllShipments.fulfilled, (state, action) => {
        state.loading = false;
        state.shipments = action.payload.shipments || [];
        state.totalShipments = action.payload.totalShipments || 0;
        state.pages = action.payload.pages || 1;
      })
      .addCase(createShipment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Instant UI update: Prepend the new shipment to the list
        state.shipments = [action.payload, ...state.shipments];
      })
      .addCase(updateShipmentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.shipments.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.shipments[index] = action.payload;
        }
      })

      /* --- GLOBAL MATCHERS (Best Practice) --- */
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearErrors, resetShipmentStatus } = shippingSlice.actions;
export default shippingSlice.reducer;
