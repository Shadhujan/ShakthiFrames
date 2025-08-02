// ----------------- START OF FINAL, CORRECTED OrderCompletePage.tsx -----------------

import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStripe } from '@stripe/react-stripe-js';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { createOrder } from '@/api/orderApi';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OrderCompletePage() {
  const stripe = useStripe();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // We only need the token from the auth store for this page.
  const token = useAuthStore((state) => state.token);

  // Create a ref to prevent the effect from running twice in development's Strict Mode.
  const effectRan = useRef(false);

  useEffect(() => {
    // Prevent the effect from running if Stripe isn't initialized yet or if it has already run.
    if (!stripe || effectRan.current === true) {
      return;
    }

    // Set the flag to true immediately to prevent re-execution.
    effectRan.current = true;

    const processOrder = async () => {
      const clientSecret = searchParams.get('payment_intent_client_secret');
      if (!clientSecret) {
        setStatus('error');
        setMessage('Payment information is missing. Please try again.');
        return;
      }

      // Retrieve the final payment status from Stripe
      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Payment successful! Creating your order...');
          try {
            // --- THIS IS THE KEY CHANGE ---
            // Get the LATEST state directly from the store right before creating the order.
            const { items, shippingAddress, getCartTotal, clearCart } = useCartStore.getState();

            if (items.length === 0 || !shippingAddress) {
              throw new Error("Your cart is empty or shipping address is missing.");
            }

            const orderData = {
              orderItems: items,
              shippingAddress: shippingAddress,
              totalPrice: getCartTotal(),
              isPaid: true,
              paidAt: new Date().toISOString(),
              paymentResult: { id: paymentIntent.id, status: paymentIntent.status }
            };

            const newOrder = await createOrder(orderData, token!);

            setOrderId(newOrder._id);
            setStatus('success');
            clearCart(); // Clear the cart only after a successful order creation.
            toast.success("Your order has been placed!");

          } catch (orderError: any) {
             setStatus('error');
             setMessage(orderError.message || 'Your payment was successful, but we failed to create your order. Please contact support.');
             toast.error('Failed to save your order. Please contact support.');
          }
          break;

        case 'processing':
          setMessage("Your payment is still processing. We will update you shortly.");
          setStatus('loading');
          break;

        default:
          setMessage(paymentIntent?.last_payment_error?.message || 'Payment failed. Please try again.');
          setStatus('error');
          break;
      }
    };

    processOrder();

  }, [stripe, searchParams, token]); // Dependencies for the effect

  // --- RENDER LOGIC (No changes needed) ---
  if (status === 'loading') {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <h1 className="text-2xl font-bold">{message || 'Finalizing your order...'}</h1>
            <p className="text-muted-foreground">Please do not close this page.</p>
        </div>
    );
  }

  if (status === 'error') {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-3xl font-bold text-red-600 mb-2">Order Failed</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Button asChild><Link to="/cart">Return to Cart</Link></Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold text-green-600 mb-2">Thank You!</h1>
        <p className="text-muted-foreground mb-6">Your order has been successfully placed.</p>
        {orderId && (
            <p className="mb-8">Your Order ID is: <span className="font-mono bg-gray-100 p-1 rounded">{orderId}</span></p>
        )}
        <Button asChild><Link to="/products">Continue Shopping</Link></Button>
    </div>
  );
}