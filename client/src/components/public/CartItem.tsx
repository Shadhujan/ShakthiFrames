// ----------------- START OF CORRECTED CartItem.tsx -----------------

import { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/store/cartStore';
import type { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCartStore();

  // Local state for quantity to provide instant UI feedback
  const [quantity, setQuantity] = useState(item.quantity);

  // This function updates both local and global state
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    // --- FIX 1: Use `item.product` instead of `item.productId` ---
    updateQuantity(item.product, newQuantity);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    // Handle case where user deletes the number, default to 1
    handleQuantityChange(isNaN(value) ? 1 : value);
  };

  const incrementQuantity = () => {
    handleQuantityChange(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      handleQuantityChange(quantity - 1);
    }
  };

  const handleRemove = () => {
    // --- FIX 2: Use `item.product` instead of `item.productId` ---
    removeFromCart(item.product);
  };

  const itemTotal = item.price * quantity;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <img
              // --- FIX 3: Use `item.image` instead of `item.imageUrl` ---
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-md"
            />
          </div>

          {/* Product Details */}
          <div className="flex-grow">
            <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
            <p className="text-gray-600">${item.price.toFixed(2)} each</p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity <= 1} className="h-8 w-8">
              <Minus className="h-4 w-4" />
            </Button>
            <Input type="number" value={quantity} onChange={handleInputChange} min="1" className="w-16 text-center" />
            <Button variant="outline" size="icon" onClick={incrementQuantity} className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Item Total */}
          <div className="text-right min-w-[80px]">
            <p className="font-semibold text-lg text-primary">${itemTotal.toFixed(2)}</p>
          </div>

          {/* Remove Button */}
          <Button variant="outline" size="icon" onClick={handleRemove} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ----------------- END OF CORRECTED CartItem.tsx -----------------