'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discipleshipService, type RelationshipsQuery } from '../services/discipleship.service';
import type { CreateRelationshipInput, MilestoneInput, CheckInInput } from '../schemas/discipleship.schema';

const KEYS = {
  all: ['discipleship'] as const,
  relationships: (params?: RelationshipsQuery) => [...KEYS.all, 'relationships', params] as const,
  relationship: (id: string) => [...KEYS.all, 'relationship', id] as const,
  tree: (userId: string) => [...KEYS.all, 'tree', userId] as const,
};

export function useRelationships(params: RelationshipsQuery = {}) {
  return useQuery({
    queryKey: KEYS.relationships(params),
    queryFn: () => discipleshipService.getRelationships(params),
    staleTime: 30_000,
  });
}

export function useRelationship(id: string) {
  return useQuery({
    queryKey: KEYS.relationship(id),
    queryFn: () => discipleshipService.getRelationshipById(id),
    enabled: !!id,
  });
}

export function useDiscipleTree(userId: string) {
  return useQuery({
    queryKey: KEYS.tree(userId),
    queryFn: () => discipleshipService.getTree(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useCreateRelationship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRelationshipInput) =>
      discipleshipService.createRelationship(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useAddMilestone(relationshipId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MilestoneInput) =>
      discipleshipService.addMilestone(relationshipId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.relationship(relationshipId) });
    },
  });
}

export function useCompleteMilestone(relationshipId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (milestoneId: string) =>
      discipleshipService.completeMilestone(milestoneId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.relationship(relationshipId) });
    },
  });
}

export function useAddCheckIn(relationshipId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CheckInInput) =>
      discipleshipService.addCheckIn(relationshipId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.relationship(relationshipId) });
    },
  });
}
