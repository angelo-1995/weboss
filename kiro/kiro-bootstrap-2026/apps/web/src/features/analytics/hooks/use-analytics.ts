'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const KEY = 'analytics';
const STALE = 10 * 60_000; // 10 min

export function useKPIs(campusId?: string) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: [KEY, 'kpis', campusId],
    queryFn: () => analyticsService.getKPIs(accessToken!, campusId),
    enabled: !!accessToken,
    staleTime: STALE,
  });
}

export function useLeaderboard(limit = 10) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: [KEY, 'leaderboard', limit],
    queryFn: () => analyticsService.getLeaderboard(accessToken!, limit),
    enabled: !!accessToken,
    staleTime: STALE,
  });
}

export function useGroupAnalytics(campusId?: string) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: [KEY, 'groups', campusId],
    queryFn: () => analyticsService.getGroupAnalytics(accessToken!, campusId),
    enabled: !!accessToken,
    staleTime: STALE,
  });
}

export function useRetention() {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: [KEY, 'retention'],
    queryFn: () => analyticsService.getRetention(accessToken!),
    enabled: !!accessToken,
    staleTime: STALE,
  });
}
