export interface Restaurant {
  id: string;
  name: string;
  currency: string;
  locale: string;
}

export interface Table {
  id: string;
  restaurantId: string;
  label: string;
  qrToken: string;
  isActive: boolean;
  restaurant: Restaurant;
}

export interface Modifier {
  id: string;
  groupId: string;
  name: string;
  priceDelta: number;
  isDefault: boolean;
  sortOrder: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  sortOrder: number;
  modifiers: Modifier[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  basePrice: number;
  kdzRate: number;
  otvRate: number;
  prepStation: 'kitchen' | 'bar';
  isAlcohol: boolean;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  modifierGroups: ModifierGroup[];
}

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  items: MenuItem[];
}

export interface OrderItemModifierSnapshot {
  id: string;
  nameSnapshot: string;
  priceDeltaSnapshot: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPriceSnapshot: number;
  kdzRateSnapshot: number;
  otvRateSnapshot: number;
  nameSnapshot: string;
  prepStation: 'kitchen' | 'bar';
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  itemNote: string | null;
  modifiers: OrderItemModifierSnapshot[];
}

export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface TableSession {
  id: string;
  sessionToken: string;
  status: string;
  table: Table;
}

export interface Order {
  id: string;
  sessionId: string;
  sequenceNo: number;
  status: OrderStatus;
  placedAt: string;
  customerNote: string | null;
  items: OrderItem[];
  session?: TableSession;
}

export interface OpenSessionResponse {
  sessionToken: string;
  table: Table;
  menu: MenuCategory[];
}
