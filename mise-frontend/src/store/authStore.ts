import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StaffRole = 'admin' | 'manager' | 'kitchen' | 'bar' | 'waiter';

interface AuthState {
  accessToken: string | null;
  role: StaffRole | null;
  restaurantId: string | null;
  setAuth: (token: string, role: StaffRole, restaurantId: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      role: null,
      restaurantId: null,
      setAuth: (accessToken, role, restaurantId) => set({ accessToken, role, restaurantId }),
      clearAuth: () => set({ accessToken: null, role: null, restaurantId: null }),
    }),
    { name: 'mise-staff-auth' },
  ),
);
