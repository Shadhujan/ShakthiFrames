// ----------------- START OF FINAL ProfileHeader.tsx -----------------

import { User } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail } from 'lucide-react';
import { format } from 'date-fns';

// Define the component's props using a TypeScript interface
interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  // Helper function to get initials from the user's name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-yellow-100">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Section */}
          <div className="relative group">
            <Avatar className="w-24 h-24 border-4 border-primary shadow-lg transition-transform duration-300 group-hover:scale-105">
              {/* Use a dynamic avatar service like DiceBear for a nice touch */}
              <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full animate-pulse" title="Online"></div>
          </div>

          {/* User Info Section */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user.name}
            </h1>

            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-700">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-700">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {/* Ensure createdAt is converted to a Date object before formatting */}
                  Member since {format(new Date(user.createdAt), 'MMMM yyyy')}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <Badge
                variant="default"
                className="capitalize bg-primary/20 text-primary hover:bg-primary/30"
              >
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
// ----------------- END OF FINAL ProfileHeader.tsx -----------------