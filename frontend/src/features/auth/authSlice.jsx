import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// --- Helper Configuration ---
const config = { headers: { "Content-Type": "application/json" } };

// --- Async Thunks ---

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { confirmPassword, ...dataToSend } = userData;
      const { data } = await axios.post(
        `/api/v1/auth/register`,
        dataToSend,
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration Failed"
      );
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `/api/v1/auth/verify-email`,
        { email, otp },
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Verification Failed"
      );
    }
  }
);

export const resendOTP = createAsyncThunk(
  "auth/resendOTP",
  async (payload, { rejectWithValue }) => {
    try {
      const email = payload.email || payload.identifier || payload;
      const { data } = await axios.post(
        `/api/v1/auth/resend-otp`,
        { email },
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Resend Failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (loginData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `http://localhost:1551/api/v1/auth/login`, // 👈 Change 5000 to 1551
        loginData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/api/v1/me`, // 👈 NO PORT HERE. Vite sends this to 1551 automatically.
        { withCredentials: true }
      );
      return data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/api/v1/me/update`, userData, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update Failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(
        "/api/v1/auth/logout",
        {},
        {
          withCredentials: true, // ✅ IMPORTANT
        }
      );
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `/api/v1/auth/password/forgot`,
        { email },
        config
      );
      return data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Request failed");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, passwords }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `/api/v1/auth/password/reset/${token}`,
        passwords,
        config
      );
      return data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Reset failed");
    }
  }
);

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (passwords, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `/api/v1/me/password/update`,
        passwords,
        config
      );
      return data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update ritual key"
      );
    }
  }
);

// --- 2FA CORE ACTIONS ---

export const loginVerify2FA = createAsyncThunk(
  "auth/loginVerify2FA",
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `/api/v1/auth/login/2fa`,
        { userId, token },
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid 2FA Code"
      );
    }
  }
);

export const setup2FA = createAsyncThunk(
  "auth/setup2FA",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`/api/v1/me/2fa/setup`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Setup failed");
    }
  }
);

export const verifyAndEnable2FA = createAsyncThunk(
  "auth/verifyAndEnable2FA",
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `/api/v1/me/2fa/verify`,
        { token },
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Verification failed"
      );
    }
  }
);

// 3. Disable 2FA (Requires password for security)
export const disable2FA = createAsyncThunk(
  "auth/disable2FA",
  async ({ password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `/api/v1/me/2fa/disable`,
        { password },
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to disable security"
      );
    }
  }
);

export const getAdminAllUsers = createAsyncThunk(
  "admin/getAdminAllUsers",
  async (
    { page = 1, limit = 10, minimal = false } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.get(
        `/api/v1/admin/users?page=${page}&limit=${limit}&minimal=${minimal}`,
        { withCredentials: true }
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const updateUserAccountStatus = createAsyncThunk(
  "admin/updateUserAccountStatus",
  async ({ id, accountStatus }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(
        `/api/v1/admin/users/${id}/status`,
        { accountStatus },
        { withCredentials: true }
      );

      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status"
      );
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "admin/updateUserRole",
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(
        `/api/v1/admin/users/${id}/role`,
        { role },
        { withCredentials: true }
      );

      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update role"
      );
    }
  }
);

// =========================
// INITIAL STATE
// =========================
const initialState = {
  user: null,
  users: [], // ✅ ADMIN USERS
  loading: false,
  isAuthenticated: false,
  isRegistered: false,
  isVerified: false,
  requires2FA: false,
  tempUserId: null,
  error: null,
  message: null,
};

// =========================
// SLICE
// =========================
const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.loading = false;
    },
    clearMessage: (state) => {
      state.message = null;
      state.loading = false;
    },
    resetRegistration: (state) => {
      state.isRegistered = false;
    },
    resetVerification: (state) => {
      state.isVerified = false;
    },
  },

  extraReducers: (builder) => {
    builder

      // =========================
      // 🔹 LOAD USER
      // =========================
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })

      // =========================
      // 🔹 LOGIN (WITH 2FA)
      // =========================
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.requires2FA = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.requires2FA) {
          state.requires2FA = true;
          state.tempUserId = action.payload.userId;
          state.isAuthenticated = false;
          state.user = null;
          state.message = action.payload.message;
        } else {
          localStorage.setItem("isLoggedIn", "true");
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.requires2FA = false;
          state.message = "Welcome back!";
        }
      })

      // =========================
      // 🔹 VERIFY 2FA
      // =========================
      .addCase(loginVerify2FA.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginVerify2FA.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.requires2FA = false;
        state.tempUserId = null;
      })

      // =========================
      // 🔹 2FA MANAGEMENT
      // =========================
      .addCase(setup2FA.pending, (state) => {
        state.error = null;
      })
      .addCase(setup2FA.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(verifyAndEnable2FA.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyAndEnable2FA.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) state.user.twoFactorEnabled = true;
        state.message = action.payload.message || "2FA Activated";
      })

      .addCase(disable2FA.pending, (state) => {
        state.loading = true;
      })
      .addCase(disable2FA.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) state.user.twoFactorEnabled = false;
        state.message = action.payload.message;
      })
      .addCase(disable2FA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =========================
      // 🔹 PROFILE & REGISTER
      // =========================
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.message = action.payload.message;
      })

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isRegistered = true;
        state.message = action.payload.message;
      })

      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.isVerified = true;
        state.message = action.payload.message;
      })

      // =========================
      // 🔹 LOGOUT
      // =========================
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.requires2FA = false;
        state.tempUserId = null;
        state.loading = false;
        localStorage.removeItem("isLoggedIn");
        state.message = "Successfully logged out";
      })

      // =========================
      // 🔹 ADMIN USERS (🔥 FIXED)
      // =========================
      .addCase(getAdminAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAdminAllUsers.fulfilled, (state, action) => {
        state.loading = false;

        console.log("ADMIN USERS:", action.payload);

        // ✅ FIXED
        state.users = action.payload.users;
      })
      .addCase(getAdminAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ✅ ADD THIS HERE
      .addCase(updateUserAccountStatus.fulfilled, (state, action) => {
        const updatedUser = action.payload;

        state.users = state.users.map((u) =>
          u._id === updatedUser._id ? updatedUser : u
        );
      })

      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload;

        state.users = state.users.map((u) =>
          u._id === updatedUser._id ? updatedUser : u
        );
      })
      // =========================
      // 🔹 SUCCESS matchesSearch
      // =========================
      .addMatcher(
        (action) =>
          [
            updatePassword.fulfilled.type,
            forgotPassword.fulfilled.type,
            resetPassword.fulfilled.type,
            resendOTP.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          state.loading = false;
          state.message = action.payload?.message || action.payload;
        }
      );
  },
});

// =========================
// EXPORTS
// =========================
export const {
  clearErrors,
  clearMessage,
  resetRegistration,
  resetVerification,
} = authSlice.actions;

export default authSlice.reducer;
