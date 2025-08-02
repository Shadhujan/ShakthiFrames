import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import CartItem from '@/components/public/CartItem';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export default function CartPage() {
  const { items, clearCart, getCartTotal, getTotalItems } = useCartStore();
  const { isLoggedIn } = useAuthStore();

  const cartTotal = getCartTotal();
  const totalItems = getTotalItems();
  const shipping = cartTotal > 100 ? 0 : 9.99;
  const tax = cartTotal * 0.08; // 8% tax
  const finalTotal = cartTotal + shipping + tax;

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Please Log In
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your shopping cart.
          </p>
          <Button asChild>
            <Link to="/auth/login">Log In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button asChild>
            <Link to="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Button variant="outline" asChild>
            <Link to="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
        <p className="text-gray-600">
          {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
           {items.map((item) => (
              <CartItem key={item.product} item={item} />
            ))}
          </div>

          {/* Clear Cart Button */}
          <div className="mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">${finalTotal.toFixed(2)}</span>
              </div>

              {shipping > 0 && (
                <p className="text-sm text-gray-600">
                  Add ${(100 - cartTotal).toFixed(2)} more for free shipping!
                </p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button className="w-full" size="lg">
                <Link to="/shipping"> {/* <-- THIS IS THE CHANGE */}
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Checkout
                </Link>
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Secure checkout with SSL encryption
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}