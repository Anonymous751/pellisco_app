  import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
  import axios from "axios";

  const API_URL = "http://localhost:1551/api/v1/storefront";

  // --- THUNKS ---

  export const fetchStorefrontData = createAsyncThunk(
    "storefront/fetchCategory",
    async (category, { getState, rejectWithValue }) => {
      try {
        const state = getState();
        const token = state.auth?.token || state.auth?.user?.token || localStorage.getItem("token");

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        };

        const { data } = await axios.get(`${API_URL}/${category}`, config);
        // Return category and data (ensure it defaults to array if null)
        return { category, data: data || [] };
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || `Failed to load ${category}`);
      }
    }
  );

  export const deployStorefront = createAsyncThunk(
    "storefront/deployAll",
    async (contentData, { getState, rejectWithValue }) => {
      try {
        const state = getState();
        const token = state.auth?.token || state.auth?.user?.token || localStorage.getItem("token");

        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        };

        const { data } = await axios.post(`${API_URL}/deploy-all`, { contentData }, config);
        return data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Deployment failed");
      }
    }
  );

  // --- SLICE ---

  const initialState = {
    contentData: {
      TopHeader: [],
      Hero: [],
      SkinCare: [],
      HairCare: [],
      Treatments: [],
      "Shop by Concern": [],
      "The Essentials": [],
    },
    loading: false,
    success: false,
    error: null,
  };

  const storefrontSlice = createSlice({
    name: "storefront",
    initialState,
    reducers: {
      addSlot: (state, action) => {
        const { category, newSlot } = action.payload;
        if (state.contentData[category]) {
          const slotToAdd = category === "TopHeader"
            ? { announcement: "", isActive: true, ...newSlot }
            : newSlot;

          state.contentData[category].push(slotToAdd);
        }
      },
      removeSlot: (state, action) => {
        const { category, id } = action.payload;
        if (state.contentData[category]) {
          state.contentData[category] = state.contentData[category].filter(
            (slot) => slot.id !== id && slot._id !== id && slot.slotId !== id
          );
        }
      },
      updateSlotContent: (state, action) => {
        const { category, id, updates } = action.payload;
        const categoryData = state.contentData[category];

        if (categoryData) {
          const index = categoryData.findIndex(
            (s) => s.id === id || s._id === id || s.slotId === id
          );

          if (index !== -1) {
            // IMPROVEMENT: Deep merge to ensure isActive toggle doesn't wipe other data
            categoryData[index] = {
              ...categoryData[index],
              ...updates,
            };
          }
        }
      },
      resetStatus: (state) => {
        state.success = false;
        state.error = null;
        state.loading = false;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchStorefrontData.pending, (state) => {
          state.loading = true;
        })
        .addCase(fetchStorefrontData.fulfilled, (state, action) => {
          state.loading = false;
          const { category, data } = action.payload;

          // PERSISTENCE IMPROVEMENT: Only update if the category exists and data is valid
          if (category && state.contentData[category] && Array.isArray(data)) {
            state.contentData[category] = data;
          }

          state.error = null;
        })
        .addCase(fetchStorefrontData.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(deployStorefront.pending, (state) => {
          state.loading = true;
        })
        .addCase(deployStorefront.fulfilled, (state) => {
          state.loading = false;
          state.success = true;
          state.error = null;
        })
        .addCase(deployStorefront.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  });

  export const { addSlot, removeSlot, updateSlotContent, resetStatus } = storefrontSlice.actions;

  export default storefrontSlice.reducer;
