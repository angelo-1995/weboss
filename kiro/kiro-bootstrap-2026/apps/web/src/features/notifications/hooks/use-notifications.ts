'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { PaginatedNotifications } from '../types/notification.types';

const NOTIFICATIONS_KEY = 'notifications';

export interface NotificationsQuery {
  cursor?: string;
  limit?: number;
}

export function useNotifications(params: NotificationsQuery = {}) {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, params],
    queryFn: () =>
      api.get<PaginatedNotifications>('/notifications', {
        limit: params.limit ?? 10,
        ...(params.cursor && { cursor: params.cursor }),
      } as Record<string, unknown>),
    staleTime: 15_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, 'unread-count'],
    queryFn: () => api.get<{ count: number }>('/notifications/unread-count'),
    refetchInterval: 30_000, // Poll every 30 seconds
    staleTime: 10_000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      api.patch<void>(`/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}
