import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",
  userId: "683155ea44c168c77e432dc8",
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
    },
  },
});

export const { setMode } = globalSlice.actions;

export default globalSlice.reducer;
