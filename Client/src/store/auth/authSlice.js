import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";

const initialState = {
  isAuthenticated: false,
  userData: null,
  loading: true, // Start as true since we verify session on app load
  error: null,
};

//* Async thunk to verify session on app load
export const verifySession = createAsyncThunk(
  "auth/verifySession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/users/me");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Session verification failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.userData = action.payload;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userData = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifySession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifySession.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.userData = action.payload.user;
      })
      .addCase(verifySession.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.userData = null;
      });
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
