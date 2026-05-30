import { createSlice } from "@reduxjs/toolkit";

const normalizeUser = (user) => {
  if (!user) return null;

  return {
    ...user,
    id: user.id || user._id?.toString?.() || user._id || null,
  };
};

const saved = JSON.parse(
  localStorage.getItem("kiranaAuth") ||
    "null"
);

const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: normalizeUser(saved?.user),
    token: saved?.token || null,
  },

  reducers: {
    setCredentials: (
      state,
      action
    ) => {
      state.user = normalizeUser(
        action.payload.user
      );

      state.token =
        action.payload.token;

      localStorage.setItem(
        "kiranaAuth",
        JSON.stringify({
          token:
            action.payload.token,
          user:
            action.payload.user,
        })
      );

      localStorage.setItem(
        "token",
        action.payload.token
      );
    },

    setUser: (
      state,
      action
    ) => {
      state.user = normalizeUser(
        action.payload
      );

      localStorage.setItem(
        "kiranaAuth",
        JSON.stringify({
          token: state.token,
          user: state.user,
        })
      );
    },

    logout: (state) => {
      state.user = null;
      state.token = null;

      localStorage.removeItem(
        "kiranaAuth"
      );

      localStorage.removeItem(
        "token"
      );
    },
  },
});

export const {
  setCredentials,
  setUser,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
