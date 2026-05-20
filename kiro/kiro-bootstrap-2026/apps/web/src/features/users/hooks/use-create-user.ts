'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import type { CreateUserInput } from '../schemas/user.schema';

export function useCreateUser() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) =>
      usersService.create(accessToken!, data as Record<string, unknown>),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
