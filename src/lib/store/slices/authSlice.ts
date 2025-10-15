import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  createdAt?: string;
  deleted?: boolean;
  email?: string;
  fullName?: string;
  id?: string;
  imageUrl?: string;
  lastSignInAt?: string;
  medicalLicense?: string;
  phoneNo?: string;
  rememberMe?: boolean;
  revokeAccess?: boolean;
  status?: string;
}

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
      }
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
