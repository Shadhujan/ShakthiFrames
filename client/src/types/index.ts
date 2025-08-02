// client/src/types/index.ts
export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stockStatus: 'In Stock' | 'Out of Stock';
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  createdAt: string;
}


export interface IUserProfile extends Partial<User> {
  phone?: string;
  address?: string;
  createdAt?: string;
  city?: string;
  country?: string;
}

export interface UpdateUserData {
  name: string;
  email: string;
  // Add other fields you want to allow updating
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  setUser: (user: User) => void;
}


export interface CartItem {
  product: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export interface IShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CartState {
  items: CartItem[];
  shippingAddress?: IShippingAddress;
  addToCart: (product: IProduct, qty: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getCartTotal: () => number; // <-- ADD this function signature
  saveShippingAddress: (address: IShippingAddress) => void;
}

export interface IOrder {
  _id: string;
  user: User; // Reference the User interface
  orderItems: CartItem[]; // Reference the CartItem interface
  shippingAddress: IShippingAddress;
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IInquiry {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'New' | 'In Progress' | 'Resolved';
  createdAt: string;
}
