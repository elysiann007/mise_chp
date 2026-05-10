import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.error?.detail || error.response?.data?.error?.code || 'Bir hata oluştu.';
    return Promise.reject(new Error(message));
  },
);

export default client;
