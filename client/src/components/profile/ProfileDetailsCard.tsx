// ----------------- START OF CORRECTED ProfileDetailsCard.tsx -----------------

import { User } from '@/types';
import { format } from 'date-fns'; // <-- 1. IMPORT the format function

export interface ProfileDetailsCardProps {
  user: User;
}

export default function ProfileDetailsCard({ user }: ProfileDetailsCardProps) {
  // --- 2. THIS IS THE FIX ---
  // We format the date string safely.
  let formattedDate = 'N/A';
  try {
    // The format function is excellent at parsing ISO date strings.
    formattedDate = format(new Date(user.createdAt), 'MMMM d, yyyy');
  } catch (error) {
    console.error("Could not format date:", user.createdAt);
    // If formatting fails, it will remain 'N/A'
  }

  return (
    <div className="border rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Profile Overview</h2>
      <div className="space-y-2">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> <span className="capitalize">{user.role}</span></p>
        {/* --- 3. DISPLAY the safely formatted date --- */}
        <p><strong>Member Since:</strong> {formattedDate}</p>
      </div>
    </div>
  );
}
// ----------------- END OF CORRECTED ProfileDetailsCard.tsx -----------------