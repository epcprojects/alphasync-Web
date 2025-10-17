import { UserAttributes } from "@/lib/graphql/attributes";
import { createSlice } from "@reduxjs/toolkit";

// State interface
interface UserState {
  user: UserAttributes | null;
}

// Initial state
const initialState: UserState = {
  user: null,
};

// Create the slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
