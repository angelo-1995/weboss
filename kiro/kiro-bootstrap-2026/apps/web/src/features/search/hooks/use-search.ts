'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useDebounce } from '@/hooks/use-debounce';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';

export interface SearchResult {
  id: string;
  type: 'users' | 'groups' | 'discipleship';
  title: string;
  subtitle?: string;
  meta?: Record<string, unknown>;
}

async function search(token: string, q: string, limit = 10): Promise<SearchResult[]> {
  const res = await fetch(`${API}/search?q=${encodeURIComponent(q)}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json() as Promise<SearchResult[]>;
}

export function useSearch(query: string, limit = 10) {
  const { accessToken } = useAuthStore();
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ['search', debouncedQuery, limit],
    queryFn: () => search(accessToken!, debouncedQuery, limit),
    enabled: !!accessToken && debouncedQuery.length >= 2,
    staleTime: 10_000,
    placeholderData: [],
  });
}
