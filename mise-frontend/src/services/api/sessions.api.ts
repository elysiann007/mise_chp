import client from './client';
import type { OpenSessionResponse, Order } from '../../types/entity.types';

export const sessionsApi = {
  open: (qrToken: string) =>
    client.post<OpenSessionResponse>('/api/v1/sessions', { qrToken }).then((r) => r.data),

  get: (sessionToken: string) =>
    client.get<{ sessionToken: string; table: any; orders: Order[] }>(`/api/v1/sessions/${sessionToken}`).then((r) => r.data),

  getOrders: (sessionToken: string) =>
    client.get<Order[]>(`/api/v1/sessions/${sessionToken}/orders`).then((r) => r.data),
};
