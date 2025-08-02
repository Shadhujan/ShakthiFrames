import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">
            Shakthi Picture Framing
          </h1>
          <p className="mt-2 text-gray-600">
            Premium framing solutions
          </p>
        </div>

        {/* Auth Form Content */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
}