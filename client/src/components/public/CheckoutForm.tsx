// ----------------- START OF FINAL CheckoutForm.tsx -----------------
import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // --- THIS IS THE CRITICAL PART ---
        // This is the URL on YOUR site where Stripe will redirect the user after they authorize the payment.
        return_url: `${window.location.origin}/order/complete`,
      },
    });

    // This code will only be reached if there's an immediate error (e.g., invalid card number).
    // Otherwise, the user is redirected to Stripe's page.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || 'An unexpected error occurred.');
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" />
      <Button disabled={isLoading || !stripe || !elements} id="submit" className="w-full">
        <span id="button-text">
          {isLoading ? <Loader2 className="animate-spin" /> : "Pay now"}
        </span>
      </Button>
      {message && <div id="payment-message" className="text-red-500 text-sm">{message}</div>}
    </form>
  );
}
// ----------------- END OF FINAL CheckoutForm.tsx -----------------