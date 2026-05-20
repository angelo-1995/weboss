'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Sermon, CreateSermonDto, UpdateSermonDto } from '../types/sermon.types';

const SERMONS_KEY = 'sermons';

export function useCreateSermon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSermonDto) => api.post<Sermon>('/sermons', data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [SERMONS_KEY] });
    },
  });
}

export function useUpdateSermon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSermonDto }) =>
      api.patch<Sermon>(`/sermons/${id}`, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: [SERMONS_KEY, id] });
      void qc.invalidateQueries({ queryKey: [SERMONS_KEY] });
    },
  });
}

export function useDeleteSermon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/sermons/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [SERMONS_KEY] });
    },
  });
}
