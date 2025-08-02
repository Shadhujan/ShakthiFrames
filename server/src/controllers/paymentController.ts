import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
}as any);

export const createPaymentIntent = async (req: Request, res: Response) => {
  const { amount } = req.body; // Amount in cents

  try {
    // --- THIS IS THE UPDATED LOGIC ---
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd', // You can change this to your currency, e.g., 'lkr'
      // This setting lets Stripe manage which payment methods are shown to the user.
      automatic_payment_methods: {
        enabled: true,
      },
    });
    // --- END OF UPDATE ---

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
};