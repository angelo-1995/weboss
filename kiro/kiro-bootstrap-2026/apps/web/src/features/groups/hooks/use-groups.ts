'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsService, type GroupsQuery, type MembersQuery } from '../services/groups.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const GROUPS_KEY = 'groups';

export function useGroups(query: GroupsQuery = {}) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: [GROUPS_KEY, query],
    queryFn: () => groupsService.findMany(accessToken!, query),
    enabled: !!accessToken,
    staleTime: 30_000,
  });
}

export function useGroup(id: string) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: [GROUPS_KEY, id],
    queryFn: () => groupsService.findById(accessToken!, id),
    enabled: !!accessToken && !!id,
  });
}

export function useGroupHierarchy(id: string) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: [GROUPS_KEY, id, 'hierarchy'],
    queryFn: () => groupsService.getHierarchy(accessToken!, id),
    enabled: !!accessToken && !!id,
  });
}

export function useGroupMembers(groupId: string, query: MembersQuery = {}) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: [GROUPS_KEY, groupId, 'members', query],
    queryFn: () => groupsService.findMembers(accessToken!, groupId, query),
    enabled: !!accessToken && !!groupId,
  });
}

export function useGroupLeaders(groupId: string) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: [GROUPS_KEY, groupId, 'leaders'],
    queryFn: () => groupsService.getLeaders(accessToken!, groupId),
    enabled: !!accessToken && !!groupId,
  });
}

export function useCreateGroup() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      groupsService.create(accessToken!, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [GROUPS_KEY] });
    },
  });
}

export function useUpdateGroup() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      groupsService.update(accessToken!, id, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: [GROUPS_KEY, id] });
      void qc.invalidateQueries({ queryKey: [GROUPS_KEY] });
    },
  });
}

export function useAddMember() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId, role }: { groupId: string; userId: string; role?: string }) =>
      groupsService.addMember(accessToken!, groupId, { userId, role }),
    onSuccess: (_, { groupId }) => {
      void qc.invalidateQueries({ queryKey: [GROUPS_KEY, groupId, 'members'] });
      void qc.invalidateQueries({ queryKey: [GROUPS_KEY, groupId] });
    },
  });
}

export function useRemoveMember() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      groupsService.removeMember(accessToken!, groupId, userId),
    onSuccess: (_, { groupId }) => {
      void qc.invalidateQueries({ queryKey: [GROUPS_KEY, groupId, 'members'] });
    },
  });
}
