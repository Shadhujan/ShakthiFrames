import { RouteObject } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';

export const authRoutes: RouteObject[] = [
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />, // This can have its own layout or none
  },
];