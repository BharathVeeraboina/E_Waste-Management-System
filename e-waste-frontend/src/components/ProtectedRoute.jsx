// src/components/ProtectedRoute.jsx (Ensure this uses getRole/getToken)

import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, getRole } from '../utils/localStorage'; 

const ProtectedRoute = ({ children }) => {
  const token = getToken();
  const role = getRole(); // We don't use it for protection here, but it's available.
  
  if (!token) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the children 
  return children;
};

export default ProtectedRoute;