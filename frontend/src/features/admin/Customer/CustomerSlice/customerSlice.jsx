import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

/** * ============================================================
 * THUNKS
 * ============================================================
 */

// 1. Fetch Stats (Tier counts, LTV, Growth)
export const fetchCustomerStats = createAsyncThunk(
  'customer/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/v1/admin/stats/customers');
      return data.stats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

// 2. Fetch All Customers (Pagination & Search)
export const fetchAllCustomers = createAsyncThunk(
  'customer/fetchAll',
  async ({ page = 1, limit = 5 }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/v1/admin/users?page=${page}&limit=${limit}`);
      return data; // Returns { users, totalUsers, totalPages, page }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

// 3. NEW: Fetch Single User Details (For the Edit Modal/View Page)
export const fetchCustomerDetails = createAsyncThunk(
  'customer/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/v1/admin/users/${id}`);
      return data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user details');
    }
  }
);

// 4. Update User Data (Name, Role, Tier, City, etc.)
export const updateCustomerByAdmin = createAsyncThunk(
  'customer/update',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      // 1. Check if we are updating account status
      const isStatusUpdate = userData.hasOwnProperty('accountStatus');

      // 2. MATCH THE ROUTER: /admin/users/:id/status
      const url = isStatusUpdate
        ? `/api/v1/admin/users/${id}/status`
        : `/api/v1/admin/users/${id}`;

      // 3. MATCH THE METHOD: Use 'patch' for status, 'put' for general
      const method = isStatusUpdate ? 'patch' : 'put';

      const { data } = await axios[method](url, userData);
      return data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

// 5. Manual Email Verification
export const verifyCustomerEmail = createAsyncThunk(
  'customer/verifyEmail',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`/api/v1/admin/users/${userId}/verify-email`);
      return { userId, user: data.user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Email verification failed');
    }
  }
);

// 6. Delete Customer
export const deleteCustomer = createAsyncThunk(
  'customer/delete',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`/api/v1/admin/users/${id}`);
      return { id, message: data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Delete failed');
    }
  }
);

/** * ============================================================
 * SLICE
 * ============================================================
 */

const customerSlice = createSlice({
  name: 'customer',
  initialState: {
    // Single user container
    user: {},
    // Array of all users for the table
    users: [],
    stats: {
      total: 0, platinum: 0, gold: 0, silver: 0, brown: 0,
      averageLTV: 0, retentionRate: "0%", recentGrowth: "+0%"
    },
    totalUsers: 0,
    totalPages: 1,
    currentPage: 1,
    loading: false,
    error: null,
    // Success flags for UI feedback
    updateSuccess: false,
    deleteSuccess: false,
    verifySuccess: false,
  },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    resetStatusFlags: (state) => {
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.verifySuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchAllCustomers.pending, (state) => { state.loading = true; })
      .addCase(fetchAllCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.totalUsers = action.payload.totalUsers;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
      })

      // FETCH SINGLE USER DETAILS
      .addCase(fetchCustomerDetails.pending, (state) => { state.loading = true; })
      .addCase(fetchCustomerDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })

      // FETCH STATS
      .addCase(fetchCustomerStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // UPDATE USER (Syncs both the list and the single user view)
      .addCase(updateCustomerByAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
        state.user = action.payload; // Update single user view
        // Update item in the list if it exists
        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) state.users[index] = action.payload;
      })

      // VERIFY EMAIL
      .addCase(verifyCustomerEmail.fulfilled, (state, action) => {
        state.verifySuccess = true;
        const index = state.users.findIndex(u => u._id === action.payload.userId);
        if (index !== -1) state.users[index].isVerified = true;
      })

      // DELETE CUSTOMER
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.deleteSuccess = true;
        state.users = state.users.filter((u) => u._id !== action.payload.id);
        state.totalUsers -= 1;
      })

      /** * GLOBAL REJECTED HANDLER
       * Catch-all for loading and error states
       */
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => { state.loading = true; }
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

export const { clearErrors, resetStatusFlags } = customerSlice.actions;
export default customerSlice.reducer;
