import type { PaginatedResponse, Group, GroupMember } from '@community-os/types';

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

export interface GroupsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  campusId?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface MembersQuery {
  page?: number;
  pageSize?: number;
  role?: string;
  search?: string;
}

export const groupsService = {
  findMany: (token: string, query: GroupsQuery = {}) => {
    const params = new URLSearchParams(
      Object.entries(query)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]),
    );
    return request<PaginatedResponse<Group>>(`/groups?${params}`, token);
  },

  findById: (token: string, id: string) =>
    request<Group>(`/groups/${id}`, token),

  getHierarchy: (token: string, id: string) =>
    request<{ group: Group; ancestors: Group[]; children: Group[] }>(
      `/groups/${id}/hierarchy`,
      token,
    ),

  create: (token: string, data: Record<string, unknown>) =>
    request<Group>('/groups', token, { method: 'POST', body: JSON.stringify(data) }),

  update: (token: string, id: string, data: Record<string, unknown>) =>
    request<Group>(`/groups/${id}`, token, { method: 'PATCH', body: JSON.stringify(data) }),

  remove: (token: string, id: string) =>
    request<void>(`/groups/${id}`, token, { method: 'DELETE' }),

  // Members
  findMembers: (token: string, groupId: string, query: MembersQuery = {}) => {
    const params = new URLSearchParams(
      Object.entries(query)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]),
    );
    return request<PaginatedResponse<GroupMember>>(`/groups/${groupId}/members?${params}`, token);
  },

  getLeaders: (token: string, groupId: string) =>
    request<GroupMember[]>(`/groups/${groupId}/members/leaders`, token),

  addMember: (token: string, groupId: string, data: { userId: string; role?: string }) =>
    request<GroupMember>(`/groups/${groupId}/members`, token, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMemberRole: (token: string, groupId: string, userId: string, role: string) =>
    request<GroupMember>(`/groups/${groupId}/members/${userId}/role`, token, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  removeMember: (token: string, groupId: string, userId: string) =>
    request<void>(`/groups/${groupId}/members/${userId}`, token, { method: 'DELETE' }),
};
