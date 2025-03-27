import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const RolValidator = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('rol');
  
  if (!allowedRoles.includes(userRole)) {
    // Si el rol no está permitido, redirigir a home
    return <Navigate to="/landing" replace />;
  }

  return children;
};

export default RolValidator;