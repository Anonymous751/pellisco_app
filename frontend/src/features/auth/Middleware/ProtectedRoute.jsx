import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, isAdmin = false }) => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // 🔥 ONLY block AFTER loading is false
  if (!loading && (!isAuthenticated || !user)) {
    console.warn("Blocked: Not Authenticated");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!loading && isAdmin && user?.role !== "admin") {
    console.warn("Blocked: Not Admin:", user?.role);
    return <Navigate to="/" replace />;
  }

  // 🔥 DO NOT block UI while loading
  return children;
};

export default ProtectedRoute;
