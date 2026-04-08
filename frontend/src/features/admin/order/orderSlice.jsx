import { createSlice, createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:1551/api/v1';

// --- ADMIN THUNKS ---

// 1. Fetch All Orders
export const fetchAdminOrders = createAsyncThunk(
  'orders/fetchAdminOrders',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/admin/orders`, { withCredentials: true });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error fetching admin orders");
    }
  }
);

// 2. Fetch Stats
export const fetchOrderStats = createAsyncThunk(
  'orders/fetchOrderStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/admin/orders/stats`, { withCredentials: true });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error fetching stats");
    }
  }
);

// 3. Update Order Status (Crucial for Dropdown)
export const updateAdminOrder = createAsyncThunk(
  'orders/updateAdminOrder',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      // Matches your route: router.put("/admin/order/:id/status"...)
      const { data } = await axios.put(
        `${BASE_URL}/admin/order/${id}/status`,
        { orderStatus: status },
        { withCredentials: true }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status");
    }
  }
);

// --- USER THUNKS ---
export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMy',
  async ({ page = 1, keyword = '' }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/orders/me`, { params: { page, keyword }, withCredentials: true });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user orders");
    }
  }
);

const initialState = {
  orders: [],
  totalOrders: 0,
  totalPages: 1,
  currentPage: 1,
  stats: {
    totalOrders: 0,
    inTransitCount: 0,
    completedCount: 0,
    pendingActionCount: 0,
    cancelledCount: 0,
    returnedCount: 0,
  },
  loading: false,
  error: null,
  isUpdated: false, // Track if an update was successful
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearErrors: (state) => { state.error = null; },
    resetOrderState: () => initialState,
    updateReset: (state) => { state.isUpdated = false; }
  },
  extraReducers: (builder) => {
    builder
      // Handle Admin List
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || [];
        state.totalOrders = action.payload.totalOrders || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.page || 1;
        state.stats.totalOrders = action.payload.totalOrders || 0;
      })
      // Handle User List
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || [];
        state.totalOrders = action.payload.totalOrders || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.page || 1;
      })
      // Handle Admin Stats
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.stats) {
          state.stats = { ...state.stats, ...action.payload.stats };
        }
      })
      // Handle Update Status Success
      .addCase(updateAdminOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.isUpdated = action.payload.success;
      })

      // Shared Loading Matchers
      .addMatcher(
        isAnyOf(
          fetchAdminOrders.pending,
          fetchMyOrders.pending,
          fetchOrderStats.pending,
          updateAdminOrder.pending
        ),
        (state) => {
          state.loading = true;
        }
      )
      // Shared Error Matchers
      .addMatcher(
        isAnyOf(
          fetchAdminOrders.rejected,
          fetchMyOrders.rejected,
          fetchOrderStats.rejected,
          updateAdminOrder.rejected
        ),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearErrors, resetOrderState, updateReset } = orderSlice.actions;
export default orderSlice.reducer;
