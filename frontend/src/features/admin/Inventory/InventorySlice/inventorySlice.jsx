import { createSlice, createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';
import axios from 'axios';

// --- CONFIGURATION ---
const BASE_URL = 'http://localhost:1551/api/v1/admin';

const axiosConfig = {
  withCredentials: true,
  headers: { "Content-Type": "multipart/form-data" }
};

// --- ASYNC THUNKS ---

// 1. Fetch Stats
export const fetchInventoryStats = createAsyncThunk(
  'inventory/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/inventory/stats`, { withCredentials: true });
      return data.stats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
    }
  }
);

// 2. Fetch Products
export const fetchAdminProducts = createAsyncThunk(
  'inventory/fetchProducts',
  async ({ page = 1, keyword = "" }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/products?page=${page}&keyword=${keyword}`,
        { withCredentials: true }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
    }
  }
);

// 3. Create Product
export const createAdminProduct = createAsyncThunk(
  'inventory/createProduct',
  async (productData, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/products`, productData, axiosConfig);
      // Refresh stats because a new product affects total count/value
      dispatch(fetchInventoryStats());
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Creation failed");
    }
  }
);

// 4. Update Product
export const updateAdminProduct = createAsyncThunk(
  'inventory/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${BASE_URL}/product/${id}`,
        productData,
        axiosConfig
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

// 5. Delete Product
export const deleteAdminProduct = createAsyncThunk(
  'inventory/deleteProduct',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.delete(
        `${BASE_URL}/product/${id}`,
        { withCredentials: true }
      );
      // Refresh stats because removing a product affects totals
      dispatch(fetchInventoryStats());
      return data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  }
);

// --- SLICE ---

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    products: [],
    stats: {
      totalProducts: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalValue: 0,
    },
    productCount: 0,
    totalPages: 1,
    currentPage: 1,
    loading: false,
    error: null,
    success: false,
    message: null,
  },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.success = false;
      state.message = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle Stats Success
      .addCase(fetchInventoryStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Handle Products Success
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.products = action.payload.products;
        state.productCount = action.payload.productCount;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      // CREATE: unshift to top of list
      .addCase(createAdminProduct.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.product) {
          state.products.unshift(action.payload.product);
          state.productCount += 1;
        }
      })
      // UPDATE: find and replace in array
      .addCase(updateAdminProduct.fulfilled, (state, action) => {
        const updatedProduct = action.payload.product;
        const index = state.products.findIndex((item) => item._id === updatedProduct._id);
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
      })
      // DELETE: filter out by ID
      .addCase(deleteAdminProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((item) => item._id !== action.meta.arg);
        state.productCount -= 1;
      })

      // --- MATCHERS FOR UI STATE ---
      .addMatcher(
        isAnyOf(
          fetchInventoryStats.pending,
          fetchAdminProducts.pending,
          deleteAdminProduct.pending,
          createAdminProduct.pending,
          updateAdminProduct.pending
        ),
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = false;
        }
      )
      .addMatcher(
        isAnyOf(
          fetchInventoryStats.fulfilled,
          fetchAdminProducts.fulfilled,
          deleteAdminProduct.fulfilled,
          createAdminProduct.fulfilled,
          updateAdminProduct.fulfilled
        ),
        (state, action) => {
          state.loading = false;
          state.success = true;
          // Dynamically set message from payload if it exists
          if (action.payload?.message || typeof action.payload === 'string') {
             state.message = action.payload.message || action.payload;
          }
        }
      )
      .addMatcher(
        isAnyOf(
          fetchInventoryStats.rejected,
          fetchAdminProducts.rejected,
          deleteAdminProduct.rejected,
          createAdminProduct.rejected,
          updateAdminProduct.rejected
        ),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
          state.success = false;
        }
      );
  },
});

export const { clearErrors, resetStatus } = inventorySlice.actions;
export default inventorySlice.reducer;
