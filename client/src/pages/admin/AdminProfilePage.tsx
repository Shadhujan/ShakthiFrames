// ----------------- START OF FINAL, GUARANTEED CORRECTED FILE -----------------

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/authStore';
import { updateMyProfile } from '@/api/userApi';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('A valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function AdminProfilePage() {
  // --- THIS IS THE NEW, STABLE PATTERN ---
  // Select each piece of state with its own hook call.
  // This is the most explicit and stable way to use Zustand.
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    // We can still set defaultValues, which will be updated by the useEffect
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
    },
  });

  // This useEffect hook populates the form once the user data is available
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        password: '',
      });
    }
  }, [user, form.reset]); // Dependency on `user` and `form.reset` is correct

  const onSubmit = async (data: ProfileFormData) => {
    if (!token) {
      toast.error("Authentication session has expired.");
      return;
    }
    try {
      const updateData: Partial<ProfileFormData> = { name: data.name, email: data.email };
      if (data.password && data.password.length > 0) {
        updateData.password = data.password;
      }

      const updatedUser = await updateMyProfile(updateData, token);

      setUser(updatedUser); // Update the global state
      toast.success('Profile updated successfully!');
      form.reset({ ...updatedUser, password: '' });
    } catch (error) {
      toast.error('Failed to update profile.');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Profile</h1>
      <Card>
        <CardHeader><CardTitle>Edit Your Details</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>New Password (optional)</FormLabel><FormControl><Input type="password" {...field} placeholder="Leave blank to keep current password" /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// ----------------- END OF FINAL, STABLE FILE -----------------