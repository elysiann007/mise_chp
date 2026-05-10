import client from './client';
import type { MenuCategory, MenuItem, ModifierGroup, Modifier, Table } from '../../types/entity.types';

function auth(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export type DashboardStats = {
  activeSessions: number;
  ordersToday: number;
  restaurant: { id: string; name: string; currency: string };
};

// Dashboard
export const getDashboard = (token: string) =>
  client.get<DashboardStats>('/api/v1/admin/dashboard', auth(token)).then((r) => r.data);

// Categories
export const getCategories = (token: string) =>
  client.get<MenuCategory[]>('/api/v1/admin/categories', auth(token)).then((r) => r.data);

export const createCategory = (token: string, data: { name: string; sortOrder?: number }) =>
  client.post<MenuCategory>('/api/v1/admin/categories', data, auth(token)).then((r) => r.data);

export const updateCategory = (token: string, id: string, data: Partial<{ name: string; sortOrder: number; isActive: boolean }>) =>
  client.patch<MenuCategory>(`/api/v1/admin/categories/${id}`, data, auth(token)).then((r) => r.data);

export const deleteCategory = (token: string, id: string) =>
  client.delete(`/api/v1/admin/categories/${id}`, auth(token));

// Menu Items
export const getMenuItems = (token: string) =>
  client.get<MenuItem[]>('/api/v1/admin/menu-items', auth(token)).then((r) => r.data);

export const createMenuItem = (token: string, data: {
  categoryId: string; name: string; description?: string;
  basePrice: number; kdzRate?: number; otvRate?: number;
  prepStation?: string; isAlcohol?: boolean; sortOrder?: number;
}) => client.post<MenuItem>('/api/v1/admin/menu-items', data, auth(token)).then((r) => r.data);

export const updateMenuItem = (token: string, id: string, data: Partial<{
  categoryId: string; name: string; description: string;
  basePrice: number; kdzRate: number; otvRate: number;
  prepStation: string; isAlcohol: boolean; isActive: boolean; sortOrder: number;
}>) => client.patch<MenuItem>(`/api/v1/admin/menu-items/${id}`, data, auth(token)).then((r) => r.data);

export const deleteMenuItem = (token: string, id: string) =>
  client.delete(`/api/v1/admin/menu-items/${id}`, auth(token));

// Modifier Groups
export const createModifierGroup = (token: string, itemId: string, data: {
  name: string; minSelect?: number; maxSelect?: number; isRequired?: boolean; sortOrder?: number;
}) => client.post<ModifierGroup>(`/api/v1/admin/menu-items/${itemId}/modifier-groups`, data, auth(token)).then((r) => r.data);

export const updateModifierGroup = (token: string, id: string, data: Partial<{
  name: string; minSelect: number; maxSelect: number; isRequired: boolean; sortOrder: number;
}>) => client.patch<ModifierGroup>(`/api/v1/admin/modifier-groups/${id}`, data, auth(token)).then((r) => r.data);

export const deleteModifierGroup = (token: string, id: string) =>
  client.delete(`/api/v1/admin/modifier-groups/${id}`, auth(token));

// Modifiers
export const createModifier = (token: string, groupId: string, data: {
  name: string; priceDelta?: number; isDefault?: boolean; sortOrder?: number;
}) => client.post<Modifier>(`/api/v1/admin/modifier-groups/${groupId}/modifiers`, data, auth(token)).then((r) => r.data);

export const updateModifier = (token: string, id: string, data: Partial<{
  name: string; priceDelta: number; isDefault: boolean; sortOrder: number;
}>) => client.patch<Modifier>(`/api/v1/admin/modifiers/${id}`, data, auth(token)).then((r) => r.data);

export const deleteModifier = (token: string, id: string) =>
  client.delete(`/api/v1/admin/modifiers/${id}`, auth(token));

// Tables
export const getTables = (token: string) =>
  client.get<Table[]>('/api/v1/admin/tables', auth(token)).then((r) => r.data);

export const createTable = (token: string, data: { label: string }) =>
  client.post<Table>('/api/v1/admin/tables', data, auth(token)).then((r) => r.data);

export const updateTable = (token: string, id: string, data: Partial<{ label: string; isActive: boolean }>) =>
  client.patch<Table>(`/api/v1/admin/tables/${id}`, data, auth(token)).then((r) => r.data);

export const deleteTable = (token: string, id: string) =>
  client.delete(`/api/v1/admin/tables/${id}`, auth(token));
