
import React from 'react';
import { useLocation } from 'react-router-dom';

const Auth = () => {
  const location = useLocation();
  const path = location.pathname;

  // Render based on pathname
  if (path.includes('login')) {
    return <div className="p-8 text-center">Login Page</div>;
  } else if (path.includes('register')) {
    return <div className="p-8 text-center">Register Page</div>;
  } else if (path.includes('reset-password')) {
    return <div className="p-8 text-center">Reset Password Page</div>;
  }

  // Default auth page
  return <div className="p-8 text-center">Auth Page</div>;
};

export default Auth;
