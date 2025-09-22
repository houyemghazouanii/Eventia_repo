import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRouteOrganizer = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'ORGANIZER') {
    return <Navigate to="/login-organizer" replace />;
  }

  return children;
};

export default PrivateRouteOrganizer;
