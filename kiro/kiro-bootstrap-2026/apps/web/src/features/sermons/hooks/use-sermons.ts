'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Sermon, PaginatedSermons, SermonAdminStats, SermonViewAnalytics } from '../types/sermon.types';

const SERMONS_KEY = 'sermons';

export interface SermonsQuery {
  cursor?: string;
  limit?: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useSermons(params: SermonsQuery = {}) {
  return useQuery({
    queryKey: [SERMONS_KEY, params],
    queryFn: () => api.get<PaginatedSermons>('/sermons', params as Record<string, unknown>),
    staleTime: 30_000,
  });
}

export function useSermon(id: string) {
  return useQuery({
    queryKey: [SERMONS_KEY, id],
    queryFn: () => api.get<Sermon>(`/sermons/${id}`),
    enabled: !!id,
  });
}

export function useSermonAdminStats() {
  return useQuery({
    queryKey: [SERMONS_KEY, 'admin', 'stats'],
    queryFn: () => api.get<SermonAdminStats>('/sermons/admin/stats'),
    staleTime: 60_000,
  });
}

export function useSermonViews(id: string) {
  return useQuery({
    queryKey: [SERMONS_KEY, id, 'views'],
    queryFn: () => api.get<SermonViewAnalytics>(`/sermons/${id}/views`),
    enabled: !!id,
  });
}
