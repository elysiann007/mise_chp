import client from './client';
import type { Order, OrderItem } from '../../types/entity.types';

function authHeader(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export function getActiveOrders(token: string, station?: string): Promise<Order[]> {
  const params = station ? `?station=${station}` : '';
  return client.get<Order[]>(`/api/v1/kitchen/orders${params}`, authHeader(token)).then((r) => r.data);
}

export function updateItemStatus(token: string, itemId: string, status: string): Promise<OrderItem> {
  return client
    .patch<OrderItem>(`/api/v1/kitchen/items/${itemId}/status`, { status }, authHeader(token))
    .then((r) => r.data);
}
