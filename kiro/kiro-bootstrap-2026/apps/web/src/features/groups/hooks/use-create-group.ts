'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsService } from '../services/groups.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import type { CreateGroupInput } from '../schemas/group.schema';

export function useCreateGroup() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupInput) =>
      groupsService.create(accessToken!, data as Record<string, unknown>),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
