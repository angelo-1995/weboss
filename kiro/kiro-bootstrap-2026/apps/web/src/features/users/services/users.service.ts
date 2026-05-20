import type { PaginatedResponse, UserProfile } from '@community-os/types';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';

async function request<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error((error as { message?: string }).message ?? 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface UsersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  campusId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const usersService = {
  findMany: (token: string, query: UsersQuery = {}) => {
    const params = new URLSearchParams(
      Object.entries(query)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]),
    );
    return request<PaginatedResponse<UserProfile>>(`/users?${params}`, token);
  },

  findById: (token: string, id: string) =>
    request<UserProfile>(`/users/${id}`, token),

  getMe: (token: string) =>
    request<UserProfile>('/users/me', token),

  create: (token: string, data: Record<string, unknown>) =>
    request<UserProfile>('/users', token, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (token: string, id: string, data: Record<string, unknown>) =>
    request<UserProfile>(`/users/${id}`, token, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateProfile: (token: string, id: string, data: Record<string, unknown>) =>
    request<UserProfile>(`/users/${id}/profile`, token, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateMyProfile: (token: string, data: Record<string, unknown>) =>
    request<UserProfile>('/users/me/profile', token, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  remove: (token: string, id: string) =>
    request<void>(`/users/${id}`, token, { method: 'DELETE' }),
};
