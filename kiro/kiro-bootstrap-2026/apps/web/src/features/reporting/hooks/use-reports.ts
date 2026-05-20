'use client';

import { useQuery } from '@tanstack/react-query';
import { reportingService } from '../services/reporting.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const KEY = 'reports';

export function useOverviewReport(campusId?: string) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: [KEY, 'overview', campusId],
    queryFn: () => reportingService.getOverview(accessToken!, campusId),
    enabled: !!accessToken,
    staleTime: 5 * 60_000, // 5 min
  });
}

export function useGrowthReport(months = 12) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: [KEY, 'growth', months],
    queryFn: () => reportingService.getGrowth(accessToken!, months),
    enabled: !!accessToken,
    staleTime: 5 * 60_000,
  });
}

export function useGroupReport(groupId: string) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: [KEY, 'group', groupId],
    queryFn: () => reportingService.getGroupReport(accessToken!, groupId),
    enabled: !!accessToken && !!groupId,
    staleTime: 5 * 60_000,
  });
}

export function useDiscipleshipReport(mentorId?: string) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: [KEY, 'discipleship', mentorId],
    queryFn: () => reportingService.getDiscipleshipReport(accessToken!, mentorId),
    enabled: !!accessToken,
    staleTime: 5 * 60_000,
  });
}
