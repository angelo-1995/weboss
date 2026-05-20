'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, type UsersQuery } from '../services/users.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const USERS_KEY = 'users';

export function useUsers(query: UsersQuery = {}) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: [USERS_KEY, query],
    queryFn: () => usersService.findMany(accessToken!, query),
    enabled: !!accessToken,
    staleTime: 30_000,
  });
}

export function useUser(id: string) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: [USERS_KEY, id],
    queryFn: () => usersService.findById(accessToken!, id),
    enabled: !!accessToken && !!id,
  });
}

export function useMe() {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: [USERS_KEY, 'me'],
    queryFn: () => usersService.getMe(accessToken!),
    enabled: !!accessToken,
    staleTime: 60_000,
  });
}

export function useUpdateUser() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      usersService.update(accessToken!, id, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: [USERS_KEY, id] });
      void qc.invalidateQueries({ queryKey: [USERS_KEY] });
    },
  });
}

export function useUpdateMyProfile() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      usersService.updateMyProfile(accessToken!, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [USERS_KEY, 'me'] });
    },
  });
}

export function useDeleteUser() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.remove(accessToken!, id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [USERS_KEY] });
    },
  });
}
