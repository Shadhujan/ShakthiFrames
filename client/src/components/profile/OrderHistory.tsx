// ----------------- START OF FINAL OrderHistory.tsx -----------------

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Package, Truck, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { IOrder, OrderStatus, CartItem as ICartItem } from '@/types';
import { format } from 'date-fns';

// Define the props the component expects
interface OrderHistoryProps {
  orders: IOrder[];
}

// Configuration object for styling and icons based on order status
const statusConfig: Record<OrderStatus, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  processing: { icon: Package, color: 'bg-blue-100 text-blue-800', label: 'Processing' },
  shipped: { icon: Truck, color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Cancelled' },
};

export function OrderHistory({ orders }: OrderHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderItems.some((item: ICartItem) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // A sub-component for the Order Details Dialog for better organization
  const OrderDetailsDialog = ({ order }: { order: IOrder }) => {
    const statusInfo = statusConfig[order.orderStatus];
    const StatusIcon = statusInfo.icon;
    return (
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details - {order._id}</DialogTitle>
          <DialogDescription>Placed on {format(new Date(order.createdAt), 'PPP')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
            <div>
              <p className="font-semibold">Status</p>
              <p>{statusInfo.label}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Items Ordered</h3>
            <div className="space-y-2">
              {order.orderItems.map((item: ICartItem) => (
                <div key={item.product} className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${(item.price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </DialogContent>
    );
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2"><Package className="w-6 h-6" />Order History</CardTitle>
        <CardDescription>View and track all your past orders</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
            <SelectTrigger className="w-full sm:w-48"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.keys(statusConfig).map(status => (
                <SelectItem key={status} value={status}>{statusConfig[status as OrderStatus].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? filteredOrders.map((order: IOrder) => {
                const statusInfo = statusConfig[order.orderStatus];
                const StatusIcon = statusInfo.icon;
                return (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono text-sm">{order._id}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge className={statusInfo.color}><StatusIcon className="w-3 h-3 mr-1" />{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">${order.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-1" />View Details</Button>
                        </DialogTrigger>
                        <OrderDetailsDialog order={order} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow><TableCell colSpan={5} className="text-center h-24">No orders found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ----------------- END OF FINAL OrderHistory.tsx -----------------