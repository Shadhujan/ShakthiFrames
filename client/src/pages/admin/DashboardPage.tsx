// ----------------- START OF FINAL DashboardPage.tsx -----------------

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingCart, MessageSquare, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import SalesChart from '@/components/admin/SalesChart';

import { useAuthStore } from '@/store/authStore';
import { getDashboardStats } from '@/api/dashboardApi';
import { LoadingPage } from '@/components/shared/LoadingPage';
import { toast } from 'sonner';
import { IOrder } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const data = await getDashboardStats(token);
        setStats(data);
      } catch (error) {
        toast.error("Failed to load dashboard data.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed': return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'processing': return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'shipped': return <Badge className="bg-yellow-100 text-yellow-800">Shipped</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  // KPI Data now comes from the API
  const kpiData = [
    { title: "Total Revenue", value: `$${stats?.totalRevenue.toFixed(2) || 0}`, icon: DollarSign, color: "text-green-600" },
    { title: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingCart, color: "text-blue-600" },
    { title: "New Inquiries", value: stats?.newInquiries || 0, icon: MessageSquare, color: "text-orange-600" },
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-lg text-gray-600">Welcome back! Here's a snapshot of your business.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{kpi.title}</CardTitle>
                <div className={`p-2 rounded-full bg-gray-100 ${kpi.color}`}><IconComponent className="h-4 w-4" /></div>
              </CardHeader>
              <CardContent><div className="text-3xl font-bold">{kpi.value}</div></CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart Placeholder */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Sales Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* --- 2. THIS IS THE REPLACEMENT --- */}
            {stats && stats.salesData && stats.salesData.length > 0 ? (
              <SalesChart data={stats.salesData} />
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-muted-foreground">Not enough data to display chart.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders Table */}
        <Card>
          <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Order ID</TableHead><TableHead>Customer</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recentOrders.map((order: IOrder) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono text-xs">{order._id.substring(0, 8)}...</TableCell>
                    <TableCell>{order.user?.name || 'N/A'}</TableCell>
                    <TableCell className="font-semibold">${order.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/products" className="p-4 border rounded-lg hover:border-collapse transition-shadow">
              {/* ... Manage Products content ... */}
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">Manage Products</span>
              </div>
            </Link>
            <Link to="/admin/orders" className="p-4 border rounded-lg hover:border-primary transition-colors">
              {/* ... View Orders content ... */}
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">Manage Orders</span>
              </div>
            </Link>
            <Link to="/admin/users" className="p-4 border rounded-lg hover:border-primary transition-colors">
              {/* ... Manage Users content ... */}
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">Manage Users</span>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
// ----------------- END OF FINAL DashboardPage.tsx -----------------