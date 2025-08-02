// ----------------- START OF FINAL, CORRECTED FILE -----------------

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User  } from '@/types';

// Import both API functions
import { registerUser as registerApi, loginUser as loginApi } from '@/api/authApi';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // --- INITIAL STATE ---
      isLoggedIn: false,
      user: null,
      token: null,

      // --- LOGIN FUNCTION (Connected to API) ---
      login: async (email: string, password: string) => {
        try {
          const { user, token } = await loginApi({ email, password });
          set({
            isLoggedIn: true,
            user: user,
            token: token,
          });
        } catch (error) {
          console.error("Login failed in store:", error);
          throw error;
        }
      },

      // --- REGISTER FUNCTION (Connected to API) ---
      register: async (email: string, password: string, name: string) => {
        try {
          const { user, token } = await registerApi({ name, email, password });
          set({
            isLoggedIn: true,
            user: user,
            token: token,
          });
        } catch (error) {
          console.error("Registration failed in store:", error);
          throw error;
        }
      },

      // --- LOGOUT FUNCTION (No changes needed) ---
      logout: () => {
        set({
          isLoggedIn: false,
          user: null,
          token: null,
        });
      },

      setUser: (newUser: User) => {
        set((state) => ({
          ...state,
          user: { ...state.user, ...newUser }, // Merges new user data with existing
        }));
      },
    }),
    {
      name: 'auth-storage', // The key for localStorage
    }
  )
);

// ----------------- END OF FINAL, CORRECTED FILE -----------------