import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartState, IProduct } from '@/types';

export const useCartStore = create<CartState>()(
  persist<CartState>(
    (set, get) => ({
      items: [],
      shippingAddress: undefined,

      addToCart: (product: IProduct, qty: number) => {
        const { items } = get();
        const existingItem = items.find(item => item.product === product._id);

        if (existingItem) {
          set({
            items: items.map(item =>
              item.product === product._id
                ? { ...item, quantity: item.quantity + qty }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                product: product._id,
                name: product.name,
                price: product.price,
                image: product.images[0],
                quantity: qty,
              },
            ],
          });
        }
      },

      saveShippingAddress: (address) => set({ shippingAddress: address }),

      removeFromCart: (productId: string) => {
        set({
          items: get().items.filter(item => item.product !== productId),
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
        } else {
          set({
            items: get().items.map(item =>
              item.product === productId ? { ...item, quantity } : item
            ),
          });
        }
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      clearCart: () => {
        set({ items: [], shippingAddress: undefined });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
