import client from './client';
import type { Order } from '../../types/entity.types';

export interface PlaceOrderPayload {
  items: {
    menuItemId: string;
    quantity: number;
    modifiers?: { modifierId: string }[];
    itemNote?: string;
  }[];
  customerNote?: string;
}

export const ordersApi = {
  place: (sessionToken: string, payload: PlaceOrderPayload) =>
    client.post<Order>(`/api/v1/sessions/${sessionToken}/orders`, payload).then((r) => r.data),

  get: (sessionToken: string, orderId: string) =>
    client.get<Order>(`/api/v1/orders/${orderId}`, { params: { sessionToken } }).then((r) => r.data),
};
