// ----------------- START OF FINAL FILE -----------------

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'; // Changed icons
import { toast } from 'sonner';

import { User } from '@/types'; // Use the correct User type
import { getUsers, deleteUser } from '@/api/userApi';
import { useAuthStore } from '@/store/authStore';
import { LoadingPage } from '@/components/shared/LoadingPage';

export default function AdminUsersPage() {
  // --- STATE MANAGEMENT ---
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { token, user: adminUser } = useAuthStore.getState();

  // --- DATA FETCHING & DELETION ---
  const fetchUsers = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getUsers(token);
      setAllUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userIdToDelete: string) => {
    if (userIdToDelete === adminUser?._id) {
        toast.error("You cannot delete your own admin account.");
        return;
    }
    if (window.confirm('Are you sure you want to permanently delete this user?')) {
      if (!token) return;
      try {
        await deleteUser(userIdToDelete, token);
        toast.success("User deleted successfully.");
        fetchUsers(); // Refresh the list
      } catch (error) {
        toast.error("Failed to delete user.");
      }
    }
  };

  // --- MEMOIZED FILTERING & PAGINATION ---
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsers, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- HELPER FUNCTIONS ---
  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Admin</Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Customer</Badge>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // --- RENDER LOGIC ---
  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-lg text-gray-600">Manage customer accounts and user permissions</p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader><CardTitle className="text-xl">User Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-600">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found</div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader><CardTitle className="text-xl">All Users</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user._id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{user.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(user._id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {paginatedUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                {/* Simplified pagination display for brevity */}
                <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ----------------- END OF FINAL FILE -----------------