import { createSlice, current, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// --- GET ALL PRODUCTS (With Dynamic Filters & Nested Price) ---
export const getProducts = createAsyncThunk(
  "product/getProducts",
  async (filterData = {}, { rejectWithValue }) => {
    try {
      const {
        keyword = "",
        currentPage = 1,
        price = [0, 100000],
        category,
        mainCategory,
        sort,
      } = filterData;

      let link = `/api/v1/products?keyword=${keyword}&page=${currentPage}&price.sale[gte]=${price[0]}&price.sale[lte]=${price[1]}`;

      if (mainCategory && mainCategory !== "All") {
        link += `&mainCategory=${mainCategory.toLowerCase()}`;
      }

      if (category && category !== "All") {
        link += `&category=${category.toLowerCase()}`;
      }

      if (sort) link += `&sort=${sort}`;

      const { data } = await axios.get(link);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load products"
      );
    }
  }
);

// --- GET SINGLE PRODUCT ---
export const getSingleProduct = createAsyncThunk(
  "product/getSingleProduct",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/v1/product/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// --- CREATE/UPDATE REVIEW (USER) ---
export const createProductReview = createAsyncThunk(
  "product/createReview",
  async (reviewData, { rejectWithValue }) => {
    try {
      const config = { headers: { "Content-Type": "application/json" } };
      const { data } = await axios.put(`/api/v1/review`, reviewData, config);
      return data.success;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Could not submit review"
      );
    }
  }
);

// --- GET FEATURED REVIEWS (HOMEPAGE) ---
export const getFeaturedReviews = createAsyncThunk(
  "product/getFeaturedReviews",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/v1/reviews/featured");
      return data.reviews;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch featured reviews"
      );
    }
  }
);

// --- UPDATE REVIEW STATUS (ADMIN) ---
export const updateReviewStatusAction = createAsyncThunk(
  "product/updateReviewStatus",
  async (reviewData, { rejectWithValue }) => {
    try {
      const config = { headers: { "Content-Type": "application/json" } };
      const { data } = await axios.put(
        `/api/v1/admin/review/status`,
        reviewData,
        config
      );
      return data.success;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update review status"
      );
    }
  }
);

export const deleteReviewAction = createAsyncThunk(
  "product/deleteReview",
  async ({ productId, reviewId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(
        `/api/v1/admin/review?productId=${productId}&id=${reviewId}`
      );
      return data.success; // This returns 'true' to action.payload
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const getAllReviewsAction = () => async (dispatch) => {
  try {
    dispatch({ type: "ALL_REVIEWS_REQUEST" });

    // Using the new global route we defined
    const { data } = await axios.get("/api/v1/reviews/all");

    dispatch({
      type: "ALL_REVIEWS_SUCCESS",
      payload: data.reviews, // Matches 'reviews' from the controller response
    });

    console.log("REDUX_LOG: Global reviews fetched successfully", data.reviews);
  } catch (error) {
    dispatch({
      type: "ALL_REVIEWS_FAIL",
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Clear Errors
export const clearErrors = () => async (dispatch) => {
  dispatch({ type: "CLEAR_ERRORS" });
};

const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    loading: false,
    error: null,
    product: null,
    productCount: 0,
    filteredProductsCount: 0,
    resultPerPage: 0,
    totalPages: 0,
    success: false,
    isUpdated: false,
    featuredReviews: [],
  },
  reducers: {
    removeError: (state) => {
      state.error = null;
    },
    resetReviewState: (state) => {
      state.success = false;
    },
    resetAdminReviewState: (state) => {
      state.isUpdated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      /* --- 1. PUBLIC: GET ALL PRODUCTS --- */
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.productCount = action.payload.productCount;
        state.filteredProductsCount = action.payload.filteredProductsCount;
        state.resultPerPage = action.payload.resultPerPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* --- 2. PUBLIC: GET SINGLE PRODUCT --- */
      .addCase(getSingleProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSingleProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload.product;
        // console.log("REDUX DEBUG - State after fetch:", current(state));
      })
      .addCase(getSingleProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* --- 3. PUBLIC: GET FEATURED REVIEWS (HOMEPAGE) --- */
      .addCase(getFeaturedReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFeaturedReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredReviews = action.payload;
      })
      .addCase(getFeaturedReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* --- 4. USER: CREATE/UPDATE REVIEW --- */
      .addCase(createProductReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProductReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* --- 5. ADMIN: UPDATE REVIEW STATUS --- */
      .addCase(updateReviewStatusAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateReviewStatusAction.fulfilled, (state, action) => {
        state.loading = false;
        state.isUpdated = action.payload;
      })
      .addCase(updateReviewStatusAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* --- 6. ADMIN: DELETE REVIEW --- */
      .addCase(deleteReviewAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteReviewAction.fulfilled, (state, action) => {
        state.loading = false;
        state.isUpdated = action.payload; // Successfully toggles isUpdated to trigger refresh
      })
      .addCase(deleteReviewAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase("ALL_REVIEWS_REQUEST", (state) => {
        state.loading = true;
      })
      .addCase("ALL_REVIEWS_SUCCESS", (state, action) => {
        state.loading = false;
        state.reviews = action.payload; // This puts Amit & Amarjeet into the state
      })
      .addCase("ALL_REVIEWS_FAIL", (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { removeError, resetReviewState, resetAdminReviewState } =
  productSlice.actions;

export default productSlice.reducer;
