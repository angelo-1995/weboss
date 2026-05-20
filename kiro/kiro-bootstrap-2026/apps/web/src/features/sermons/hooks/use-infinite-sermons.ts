'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { PaginatedSermons } from '../types/sermon.types';

export interface InfiniteSermonsParams {
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useInfiniteSermons(params: InfiniteSermonsParams = {}) {
  return useInfiniteQuery({
    queryKey: ['sermons', 'infinite', params],
    queryFn: ({ pageParam }) =>
      api.get<PaginatedSermons>('/sermons', {
        cursor: pageParam,
        limit: params.limit ?? 12,
        ...(params.search && { search: params.search }),
        ...(params.dateFrom && { dateFrom: params.dateFrom }),
        ...(params.dateTo && { dateTo: params.dateTo }),
      } as Record<string, unknown>),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
  });
}
