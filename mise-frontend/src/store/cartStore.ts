import { create } from 'zustand';
import type { MenuItem } from '../types/entity.types';

export interface CartModifier {
  modifierId: string;
  name: string;
  priceDelta: number;
}

export interface CartItem {
  cartId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedModifiers: CartModifier[];
  itemNote: string;
}

interface CartState {
  items: CartItem[];
  addItem: (menuItem: MenuItem, quantity: number, modifiers: CartModifier[], note: string) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (menuItem, quantity, modifiers, note) => {
    const cartId = `${menuItem.id}-${Date.now()}`;
    set((state) => ({
      items: [...state.items, { cartId, menuItem, quantity, selectedModifiers: modifiers, itemNote: note }],
    }));
  },

  removeItem: (cartId) =>
    set((state) => ({ items: state.items.filter((i) => i.cartId !== cartId) })),

  updateQuantity: (cartId, quantity) =>
    set((state) => ({
      items: quantity <= 0
        ? state.items.filter((i) => i.cartId !== cartId)
        : state.items.map((i) => i.cartId === cartId ? { ...i, quantity } : i),
    })),

  clear: () => set({ items: [] }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce((sum, item) => {
      const modTotal = item.selectedModifiers.reduce((s, m) => s + m.priceDelta, 0);
      return sum + (Number(item.menuItem.basePrice) + modTotal) * item.quantity;
    }, 0),
}));
