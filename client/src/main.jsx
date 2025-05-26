import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { configureStore } from "@reduxjs/toolkit";
import globalReducer from "./state/index";
import userReducer from "./state/userSlice";
import adsReducer from "./state/adSlice";
import { Provider } from "react-redux";

const store = configureStore({
  reducer: {
    global: globalReducer,
    user: userReducer,
    ads: adsReducer,
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
