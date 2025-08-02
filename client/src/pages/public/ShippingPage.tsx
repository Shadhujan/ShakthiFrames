// ----------------- START OF FINAL, CORRECTED ShippingPage.tsx -----------------

import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCartStore } from '@/store/cartStore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const shippingSchema = z.object({
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

export default function ShippingPage() {
  const navigate = useNavigate();

const saveShippingAddress = useCartStore(state => state.saveShippingAddress);
const shippingAddress = useCartStore(state => state.shippingAddress);


  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      address: shippingAddress?.address || '',
      city: shippingAddress?.city || '',
      postalCode: shippingAddress?.postalCode || '',
      country: shippingAddress?.country || '',
    },
  });

  const onSubmit = (data: ShippingFormData) => {
    saveShippingAddress(data);
    navigate('/payment');
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Shipping Details</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="city" render={({ field }) => (
            <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="postalCode" render={({ field }) => (
            <FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="country" render={({ field }) => (
            <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <Button type="submit" className="w-full">Continue to Payment</Button>
        </form>
      </Form>
    </div>
  );
}
// ----------------- END OF FINAL, CORRECTED ShippingPage.tsx -----------------