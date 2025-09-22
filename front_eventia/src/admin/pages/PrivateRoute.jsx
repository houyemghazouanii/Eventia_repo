import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, roleRequired }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== roleRequired) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default PrivateRoute;
