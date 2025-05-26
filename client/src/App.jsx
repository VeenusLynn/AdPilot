import React, { useMemo } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme.js";
import { useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./scenes/dashboard/index.jsx";
import Layout from "./scenes/layout/index.jsx";
import Signup from "./scenes/signup/index.jsx";
import Login from "./scenes/login/index.jsx";
import Landing from "./scenes/landing/index.jsx";
import Campaigns from "./scenes/campaigns/index.jsx";
import Billing from "./scenes/billing/index.jsx";
import Settings from "./scenes/settings/index.jsx";
import Profile from "./scenes/profile/index.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AuthProvider from "./components/AuthProvider.jsx";
import NotificationProvider from "./components/NotificationProvider.jsx";

const App = () => {
  const mode = useSelector((state) => state.global.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <NotificationProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              {/* Protected routes */}
              <Route element={<AuthProvider />}>
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/campaigns" element={<Campaigns />} />
                    <Route path="/billing" element={<Billing />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </NotificationProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
};

export default App;
