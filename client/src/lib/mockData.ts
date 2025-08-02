export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  description: string;
  inStock: boolean;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Classic Gold Frame',
    category: 'Gold Frames',
    price: 89.99,
    imageUrl: 'https://images.pexels.com/photos/1579708/pexels-photo-1579708.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Elegant gold-finished frame perfect for portraits and artwork',
    inStock: true,
  },
  {
    id: '2',
    name: 'Modern Silver Frame',
    category: 'Silver Frames',
    price: 65.99,
    imageUrl: 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Sleek silver frame with contemporary design',
    inStock: true,
  },
  {
    id: '3',
    name: 'Vintage Wooden Frame',
    category: 'Wooden Frames',
    price: 125.99,
    imageUrl: 'https://images.pexels.com/photos/1579727/pexels-photo-1579727.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Handcrafted wooden frame with vintage appeal',
    inStock: false,
  },
  {
    id: '4',
    name: 'Premium Black Frame',
    category: 'Black Frames',
    price: 75.99,
    imageUrl: 'https://images.pexels.com/photos/1579721/pexels-photo-1579721.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Sophisticated black frame for professional displays',
    inStock: true,
  },
  {
    id: '5',
    name: 'Ornate Baroque Frame',
    category: 'Decorative Frames',
    price: 199.99,
    imageUrl: 'https://images.pexels.com/photos/1579715/pexels-photo-1579715.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Luxurious ornate frame with baroque styling',
    inStock: true,
  },
];

export const mockCategories = [
  'Gold Frames',
  'Silver Frames',
  'Wooden Frames',
  'Black Frames',
  'Decorative Frames',
];