import { BrowserRouter, useRoutes } from 'react-router-dom';

// Import the route arrays
import { adminRoutes } from './AdminRoutes';
import { publicRoutes } from './PublicRoutes';
import { authRoutes } from './AuthRoutes';

// A component that uses the hook to render the combined routes
const AppRoutes = () => {
  const routes = useRoutes([
    ...publicRoutes,   // <-- Use it directly, without spreading
    ...authRoutes,
    ...adminRoutes,
    { path: '*', element: <div className="p-8 text-center"><h1>404 - Page Not Found</h1></div> },
  ]);

  return routes;
};

// The main router component wraps everything in BrowserRouter
export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}