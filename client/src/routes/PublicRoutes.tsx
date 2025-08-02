import { RouteObject } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import HomePage from '@/pages/public/HomePage';
import ProductsPage from '@/pages/public/ProductsPage';
import ProductDetailPage from '@/pages/public/ProductDetailPage';
import AboutUsPage from '@/pages/public/AboutUsPage';
import ContactPage from '@/pages/public/ContactPage';
import CartPage from '@/pages/public/CartPage';
import UserProfilePage from '@/pages/public/UserProfilePage';
import ShippingPage from '@/pages/public/ShippingPage';
import PaymentPage from '@/pages/public/PaymentPage';
import OrderCompletePage from '@/pages/public/OrderCompletePage';

// THIS IS THE ONLY THING THAT SHOULD BE IN THIS FILE
export const publicRoutes: RouteObject[] = [
  {
    path: '/', // The parent path
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'about', element: <AboutUsPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'profile', element: <UserProfilePage /> },

      { path: 'shipping', element: <ShippingPage /> },
      { path: 'payment', element: <PaymentPage /> },
      { path: 'order/complete', element: <OrderCompletePage /> },
    ],
  },
]