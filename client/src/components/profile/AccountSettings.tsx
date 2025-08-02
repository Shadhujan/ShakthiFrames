import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, Eye, EyeOff } from 'lucide-react';
import { User, UpdateUserData, PasswordChangeData } from '@/types';
import { toast } from 'sonner';
import { onChangePassword } from '@/api/userApi';
import { useAuthStore } from '@/store/authStore';

interface AccountSettingsProps {
  user: User;
  onUpdateUser: (data: UpdateUserData) => Promise<void>;
  onChangePassword: (data: PasswordChangeData) => Promise<void>; // ✅ Add this line
}

export function AccountSettings({ user, onUpdateUser }: AccountSettingsProps) {
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profileData, setProfileData] = useState<UpdateUserData>({
    name: user.name,
    email: user.email,
  });

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateProfileData = () => {
    const newErrors: Record<string, string> = {};
    if (!profileData.name.trim()) newErrors.name = 'Name is required';
    if (!profileData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'A valid email is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordData = () => {
    const newErrors: Record<string, string> = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (passwordData.newPassword.length < 8) newErrors.newPassword = 'New password must be at least 8 characters';
    if (passwordData.newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfileData()) return;
    setIsLoading(true);
    try {
      await onUpdateUser(profileData);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordData()) return;
    setIsLoading(true);
    try {
      await onChangePassword(passwordData, token!);
      setPasswordData({ currentPassword: '', newPassword: '' });
      setConfirmPassword('');
      toast.success('Password changed successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to change password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-8 shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-2xl text-black">Account Settings</CardTitle>
        <CardDescription>Manage your account information and security settings</CardDescription>
      </CardHeader>
      <CardContent className="m-2">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 text-white">
            <TabsTrigger value="profile" className="py-2 drop-shadow-md">Profile Information</TabsTrigger>
            <TabsTrigger value="password" className="py-2 drop-shadow-md">Change Password</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Update Profile
              </Button>
            </form>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-7 w-7 bg-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
                {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Change Password
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
