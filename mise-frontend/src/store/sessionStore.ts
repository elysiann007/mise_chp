import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuCategory, OpenSessionResponse, Table } from '../types/entity.types';

interface SessionState {
  sessionToken: string | null;
  table: Table | null;
  menu: MenuCategory[];
  setSession: (data: OpenSessionResponse) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionToken: null,
      table: null,
      menu: [],
      setSession: (data) =>
        set({ sessionToken: data.sessionToken, table: data.table, menu: data.menu }),
      clearSession: () => set({ sessionToken: null, table: null, menu: [] }),
    }),
    { name: 'mise-session' },
  ),
);
