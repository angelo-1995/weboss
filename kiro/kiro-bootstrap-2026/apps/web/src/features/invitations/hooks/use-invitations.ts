'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { PaginatedInvitations, CreateInvitationDto, Invitation } from '../types/invitation.types';

const INVITATIONS_KEY = 'invitations';

export function useInvitations(params: { cursor?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: [INVITATIONS_KEY, params],
    queryFn: () => api.get<PaginatedInvitations>('/invitations', params as Record<string, unknown>),
    staleTime: 30_000,
  });
}

export function useCreateInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvitationDto) => api.post<Invitation>('/invitations', data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [INVITATIONS_KEY] });
    },
  });
}

export function useResendInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/invitations/resend/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [INVITATIONS_KEY] });
    },
  });
}
