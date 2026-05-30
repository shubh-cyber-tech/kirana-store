import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: { dark: localStorage.getItem("theme") === "dark" },
  reducers: {
    toggleDark(state) {
      state.dark = !state.dark;
      localStorage.setItem("theme", state.dark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", state.dark);
    }
  }
});

document.documentElement.classList.toggle("dark", uiSlice.getInitialState().dark);

export const { toggleDark } = uiSlice.actions;
export default uiSlice.reducer;
