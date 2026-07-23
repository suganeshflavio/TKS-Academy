import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { clearToken, getToken, setToken } from "./authStorage";

type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
};

const initialToken = getToken();

const initialState: AuthState = {
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; name?: string }>) => {
      const { token, name } = action.payload;

      state.token = token;
      state.isAuthenticated = true;
      setToken(token, "session");
      if (name) {
        sessionStorage.setItem("adminName", name);
      }
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      clearToken();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
