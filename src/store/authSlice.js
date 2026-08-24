import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAdmin: false,
    loading: false,
    error: null,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    setAdmin(state, action) {
      state.isAdmin = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    clearAuth(state) {
      state.user = null;
      state.isAdmin = false;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setUser, setAdmin, setLoading, setError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
