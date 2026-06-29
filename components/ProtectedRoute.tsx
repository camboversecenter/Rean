
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  session: any;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ session }) => {
  const location = useLocation();

  if (!session) {
    // Redirect to login, saving the current location so we can send them back after login
    // Note: Since Supabase OAuth redirects away, state might be lost, but this works for direct client-side navigation
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
