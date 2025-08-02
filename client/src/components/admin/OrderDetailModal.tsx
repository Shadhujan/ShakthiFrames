import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryStatus: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details - #{order.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right space-y-2">
              <div>
                <Badge className={getStatusColor(order.paymentStatus)}>
                  Payment: {order.paymentStatus}
                </Badge>
              </div>
              <div>
                <Badge className={getStatusColor(order.deliveryStatus)}>
                  Delivery: {order.deliveryStatus}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-gray-600">Address</p>
                <p className="font-medium">{order.address}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-sm text-gray-600">{formatPrice(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Total */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount</span>
            <span className="text-xl font-bold text-orange-600">{formatPrice(order.total)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}