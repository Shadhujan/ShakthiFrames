import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '@/types';
import { registerUser as registerApi, loginUser as loginApi } from '@/api/authApi';
import { useCartStore } from './cartStore';

export const useAuthStore = create<AuthState & {
  _hasHydrated: boolean;
  setHasHydrated: () => void;
    }>()(
      persist(
        (set, get) => ({
          // --- INITIAL STATE ---
          isLoggedIn: false,
          user: null,
          token: null,
          _hasHydrated: false, // ✅ hydration tracking
          setHasHydrated: () => set({ _hasHydrated: true }),

      // --- LOGIN FUNCTION ---
      login: async (email: string, password: string) => {
        try {
          const { user, token } = await loginApi({ email, password });
          useCartStore.getState().clearCart();
          set({ isLoggedIn: true, user, token });
        } catch (error) {
          console.error("Login failed in store:", error);
          throw error;
        }
      },

      // --- REGISTER FUNCTION ---
      register: async (email: string, password: string, name: string) => {
        try {
          const { user, token } = await registerApi({ name, email, password });
          useCartStore.getState().clearCart();
          set({ isLoggedIn: true, user, token });
        } catch (error) {
          console.error("Registration failed in store:", error);
          throw error;
        }
      },

      // --- LOGOUT FUNCTION ---
      logout: () => {
        useCartStore.getState().clearCart();
        set({ isLoggedIn: false, user: null, token: null });
      },

      setUser: (newUser: User) => {
        set((state) => ({
          ...state,
          user: { ...state.user, ...newUser },
        }));
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated?.();
      },
    }
  )
);
