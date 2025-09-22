import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoutePartcipant = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'USER') {
    return <Navigate to="/login-participant" replace />;
  }

  return children;
};

export default PrivateRoutePartcipant;
