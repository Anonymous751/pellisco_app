import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// =========================
// 📥 GET SETTINGS
// =========================
export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/v1/settings");
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch settings"
      );
    }
  }
);

// =========================
// ✏️ UPDATE SETTINGS
// =========================
export const updateSettings = createAsyncThunk(
  "settings/updateSettings",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.put("/api/v1/settings", payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update settings"
      );
    }
  }
);
