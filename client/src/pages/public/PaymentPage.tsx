// ----------------- START OF FINAL, CORRECTED PaymentPage.tsx -----------------

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import CheckoutForm from '@/components/public/CheckoutForm';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { LoadingPage } from '@/components/shared/LoadingPage';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { DummyCard } from '@/components/public/DummyCard';  // <-- Correct import

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PaymentPage() {
  const [clientSecret, setClientSecret] = useState('');
  const { getCartTotal, getTotalItems } = useCartStore();
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  const cartTotal = getCartTotal();
  const totalItems = getTotalItems();
  const shipping = cartTotal > 100 ? 0 : 9.99;
  const tax = cartTotal * 0.08;
  const finalTotal = cartTotal + shipping + tax;

  // State to control DummyCard dialog visibility
  const [showDummyCard, setShowDummyCard] = useState(false);

useEffect(() => {
  if (!hasHydrated || !token || finalTotal <= 0) return;

  const createIntent = async () => {
    try {
      const response = await axios.post(
        '/api/v1/payment/create-payment-intent',
        { amount: Math.round(finalTotal * 100) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClientSecret(response.data.clientSecret);
    } catch (error) {
      console.error("Failed to create payment intent:", error);
    }
  };

  createIntent();
}, [hasHydrated, token, finalTotal]);


  const appearance = { theme: 'stripe' as const };
  const options: StripeElementsOptions = { clientSecret, appearance };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Confirm and Pay</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between"><span>Subtotal ({totalItems} items)</span><span>${cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span></div>
              <div className="flex justify-between"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold"><span>Total</span><span className="text-primary">${finalTotal.toFixed(2)}</span></div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Payment Details</h2>
          {clientSecret ? (
            <Elements options={options} stripe={stripePromise} key={clientSecret}>
              <CheckoutForm />
            </Elements>
          ) : (
            <div className="flex items-center justify-center p-8 border rounded-lg h-[150px]">
              <LoadingPage />
            </div>
          )}
          <div className="mt-6 flex items-center justify-center gap-2">
            <p className="text-sm text-muted-foreground">Need a test card?</p>
            <Button variant="outline" onClick={() => setShowDummyCard(true)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Show Dummy Card
            </Button>
          </div>
        </div>
      </div>

      {/* Render DummyCard with proper props */}
      <DummyCard
        isOpen={showDummyCard}
        onClose={() => setShowDummyCard(false)}
      />
    </div>
  );
}
// ----------------- END OF FINAL, CORRECTED PaymentPage.tsx -----------------
