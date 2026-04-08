import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// --- THUNKS ---

// 1. Fetch Main Analytics (Revenue, AOV, Conversion, Chart, Total Visitors, Live Users)
export const fetchAnalyticsIntelligence = createAsyncThunk(
  'adminAnalytics/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      // Hits the backend endpoint for real-time DB stats
      const { data } = await axios.get('/api/v1/admin/analytics', { withCredentials: true });
      // Data expected: { success: true, analytics: { totalRevenue, totalOrders, totalVisitors, liveUsers, ... } }
      return data.analytics;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load analytics");
    }
  }
);

// 2. Fetch Logistics (Order status counts)
export const fetchOrderLogistics = createAsyncThunk(
  'adminAnalytics/fetchLogistics',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/v1/admin/orders/stats', { withCredentials: true });
      // Data expected: { success: true, stats: { completedCount, inTransitCount, ... } }
      return data.stats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load logistics");
    }
  }
);

const adminAnalyticsSlice = createSlice({
  name: 'adminAnalytics',
  initialState: {
    stats: null,      // Revenue, AOV, Total Visitors, Live Users, Conversion, Chart
    logistics: null,  // Order status counts
    loading: false,
    error: null,
  },
  reducers: {
    // Manually clear error via toast/useEffect
    clearAnalyticsErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Success: Analytics (Populates both historical and live tracking data)
      .addCase(fetchAnalyticsIntelligence.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      // Success: Logistics
      .addCase(fetchOrderLogistics.fulfilled, (state, action) => {
        state.loading = false;
        state.logistics = action.payload;
      })

      // --- MATCHERS (Global Logic for all Thunks) ---

      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          // Note: We do not nullify existing state here so the UI remains interactive during refreshes
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearAnalyticsErrors } = adminAnalyticsSlice.actions;
export default adminAnalyticsSlice.reducer;
