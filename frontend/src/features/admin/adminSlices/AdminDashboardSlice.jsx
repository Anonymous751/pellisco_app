import { createSlice, createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';
import axios from 'axios';

// --- 1. ASYNC THUNKS ---

// Fetch Admin Customer Stats
export const fetchCustomerStats = createAsyncThunk(
  "admin/fetchCustomerStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/v1/admin/stats/customers");
      return data.stats;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Redeem Points (Used by User or Admin)
export const redeemUserPoints = createAsyncThunk(
  "admin/redeemPoints",
  async (pointsToRedeem, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/v1/points/redeem", { pointsToRedeem });
      return data; // returns discountAmount and remainingPoints
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// --- 2. SLICE DEFINITION ---

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    customerStats: null,
    loading: false,
    error: null,
    redeemData: null,
    success: false,
  },
  reducers: {
    // Standard reducers for manual state clearing
    clearAdminErrors: (state) => {
      state.error = null;
    },
    resetAdminStatus: (state) => {
      state.success = false;
      state.redeemData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle Customer Stats Success
      .addCase(fetchCustomerStats.fulfilled, (state, action) => {
        state.loading = false;
        state.customerStats = action.payload;
      })

      // Handle Point Redemption Success
      .addCase(redeemUserPoints.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.redeemData = action.payload;
        if (state.user) {
        state.user.points = action.payload.remainingPoints;
    }
      })

      /* --- 3. MATCHERS (The "Clean" Way) ---
         Instead of writing .addCase(pending) for every single thunk,
         we use matchers to handle all admin-related loading/error states.
      */
      .addMatcher(
        isAnyOf(fetchCustomerStats.pending, redeemUserPoints.pending),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(fetchCustomerStats.rejected, redeemUserPoints.rejected),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearAdminErrors, resetAdminStatus } = adminSlice.actions;
export default adminSlice.reducer;
