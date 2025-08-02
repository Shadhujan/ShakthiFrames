// ----------------- CORRECTED AdminRoute.tsx -----------------

import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function AdminRoute() { // Removed the 'children' prop
  const { isLoggedIn, user } = useAuthStore((state) => ({
    isLoggedIn: state.isLoggedIn,
    user: state.user,
  }));

  const location = useLocation();

  if (!isLoggedIn || user?.role !== 'admin') {
    // If not an admin, redirect to the admin login page
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If they are a verified admin, render the nested child route
  return <Outlet />;
}