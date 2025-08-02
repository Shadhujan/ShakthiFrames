// ----------------- START OF FINAL UserProfilePage.tsx -----------------

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getMyProfile, updateMyProfile } from '@/api/userApi';
import { getMyOrders } from '@/api/orderApi'; // Correctly importing the new function
import { UpdateUserData, PasswordChangeData, IOrder } from '@/types'; // Removed unused 'User' import

import { Toaster, toast } from 'sonner';
import { LoadingPage } from '@/components/shared/LoadingPage';
// --- FIX: Use named imports for all components ---
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { AccountSettings } from '@/components/profile/AccountSettings';
import { OrderHistory } from '@/components/profile/OrderHistory';
import { AccountManagement } from '@/components/profile/AccountManagement'; // Changed from AccountActions to match component

export default function UserProfilePage() {
  const { user, token, setUser, isLoggedIn } = useAuthStore();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialData = async () => {
      if (!isLoggedIn || !token) {
        toast.error("Please log in to view your profile.");
        navigate('/auth/login');
        return;
      }
      try {
        const [profileData, orderData] = await Promise.all([
          getMyProfile(token),
          getMyOrders(token)
        ]);

        setUser(profileData);
        setOrders(orderData);
      } catch (error) {
        console.error("Failed to load user data:", error);
        toast.error("Failed to load your data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [token, setUser, navigate]);

  const handleUpdateUser = async (data: UpdateUserData): Promise<void> => {
    if (!token) throw new Error("Authentication error");
    try {
      const updatedUser = await updateMyProfile(data, token);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
      throw error;
    }
  };

  // Handler stubs for future implementation
  const handleChangePassword = async (data: PasswordChangeData): Promise<void> => { console.log(data); };
  const handleDeleteAccount = async (): Promise<void> => { console.log("Deleting account..."); };
  const handleExportData = async (): Promise<void> => { console.log("Exporting data..."); };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-600">Could not load profile. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">My Account</h1>
          <p className="text-gray-600">Manage your profile, orders, and settings.</p>
        </div>
        <div className="space-y-10">
          <ProfileHeader user={user} />
          <AccountSettings
            user={user}
            onUpdateUser={handleUpdateUser}
            onChangePassword={handleChangePassword}
          />
          <OrderHistory orders={orders} />
          <AccountManagement
            onDeleteAccount={handleDeleteAccount}
            onExportData={handleExportData}
          />
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
// ----------------- END OF FINAL UserProfilePage.tsx -----------------