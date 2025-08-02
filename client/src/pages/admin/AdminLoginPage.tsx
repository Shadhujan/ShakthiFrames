// ----------------- START OF FINAL AdminLoginPage.tsx -----------------

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react'; // Added Loader2
import { useAuthStore } from '@/store/authStore'; // <-- 1. IMPORT our real auth store

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore(); // <-- 2. USE the login function from our store
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin'; // Redirect to main admin dashboard

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError, // Use setError from react-hook-form
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);

    try {
      // --- 3. CALL the real login function from the store ---
      await login(data.email, data.password);

      // --- 4. CHECK the user's role AFTER successful login ---
      const { user } = useAuthStore.getState();
      if (user && user.role === 'admin') {
        toast.success('Admin login successful!');
        navigate(from, { replace: true });
      } else {
        // If the user is not an admin, log them out and show an error
        useAuthStore.getState().logout();
        setError('root.serverError', { type: 'manual', message: 'Access denied. Not an admin user.' });
        toast.error('Access denied. Not an admin user.');
      }
    } catch (error: any) {
      // The API or store will throw an error for invalid credentials
      setError('root.serverError', { type: 'manual', message: error.message });
      toast.error(error.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            <span className="text-orange-500">SPF</span> Admin Login
          </CardTitle>
          <p className="text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...register('email')} placeholder="admin@example.com" />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} placeholder="Enter your password" />
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {/* Display root server errors */}
            {errors.root?.serverError && (
              <p className="text-sm text-red-600 text-center">{errors.root.serverError.message}</p>
            )}

            <Button type="submit" disabled={isLoading} className="w-full bg-orange-500 hover:bg-orange-600">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}