// ----------------- START OF CORRECTED AdminRoutes.tsx -----------------

import { Navigate, Outlet, useLocation, RouteObject } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import AdminLayout from '@/layouts/AdminLayout';
import DashboardPage from '@/pages/admin/DashboardPage';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
import ProductFormPage from '@/pages/admin/ProductFormPage';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminInquiriesPage from '@/pages/admin/AdminInquiriesPage';
import AdminProfilePage from '@/pages/admin/AdminProfilePage';

// The Gatekeeper Component (no changes here)
const AdminRouteProtection = () => {
  const { isLoggedIn, user } = useAuthStore.getState();
  const location = useLocation();

  if (!isLoggedIn || user?.role !== 'admin') {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Outlet />; // Renders the nested routes
};
// The Route Definitions as an array
export const adminRoutes: RouteObject[] = [
  {
    element: <AdminRouteProtection />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'products', element: <AdminProductsPage /> },
          { path: 'products/new', element: <ProductFormPage /> },
          { path: 'products/edit/:id', element: <ProductFormPage /> },
          { path: 'orders', element: <AdminOrdersPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'inquiries', element: <AdminInquiriesPage /> },
          { path: 'profile', element: <AdminProfilePage /> }
        ],
      },
    ],
  },
];
// ----------------- END OF CORRECTED AdminRoutes.tsx -----------------