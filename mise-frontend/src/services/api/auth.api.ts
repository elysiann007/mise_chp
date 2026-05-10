import client from './client';

export type LoginResponse = {
  accessToken: string;
  role: string;
  restaurantId: string;
};

export function login(email: string, password: string): Promise<LoginResponse> {
  return client.post<LoginResponse>('/api/v1/auth/login', { email, password }).then((r) => r.data);
}
