import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * AdminRoute — wraps protected admin-only routes.
 * Redirects non-admin users to /dashboard instead of /login
 * so viewers land somewhere valid after being authenticated.
 */
const AdminRoute = ({ children }) => {
  const user = useSelector((state) => state.user.data);

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
