import { api } from '@/lib/api-client';
import type { CreateRelationshipInput, MilestoneInput, CheckInInput } from '../schemas/discipleship.schema';

export interface DiscipleshipRelationship {
  id: string;
  mentorId: string;
  discipleId: string;
  type: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  notes?: string | null;
  mentor: { id: string; firstName: string; lastName: string; email: string; avatarUrl?: string | null };
  disciple: { id: string; firstName: string; lastName: string; email: string; avatarUrl?: string | null };
  _count?: { milestones: number; checkIns: number };
}

export interface Milestone {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  status: string;
  completedAt?: string | null;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  date: string;
  notes: string;
  rating: number;
  attendees?: string | null;
  topics?: string | null;
  createdAt: string;
}

export interface DiscipleshipDetail extends DiscipleshipRelationship {
  milestones: Milestone[];
  checkIns: CheckIn[];
}

export interface TreeNode {
  id: string;
  type: string;
  disciple: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
  };
  startDate: string;
  discipleCount: number;
  children: TreeNode[];
}

export interface RelationshipsQuery {
  page?: number;
  pageSize?: number;
  mentorId?: string;
  discipleId?: string;
  type?: string;
  status?: string;
}

export const discipleshipService = {
  createRelationship(data: CreateRelationshipInput) {
    return api.post<DiscipleshipRelationship>('/discipleship/relationships', data);
  },

  getRelationships(params: RelationshipsQuery = {}) {
    return api.get<{ data: DiscipleshipRelationship[]; total: number }>('/discipleship/relationships', params as Record<string, unknown>);
  },

  getRelationshipById(id: string) {
    return api.get<DiscipleshipDetail>(`/discipleship/relationships/${id}`);
  },

  getTree(userId: string) {
    return api.get<TreeNode[]>(`/discipleship/tree/${userId}`);
  },

  addMilestone(relationshipId: string, data: MilestoneInput) {
    return api.post<Milestone>(`/discipleship/${relationshipId}/milestones`, data);
  },

  completeMilestone(milestoneId: string) {
    return api.patch<Milestone>(`/discipleship/milestones/${milestoneId}/complete`);
  },

  addCheckIn(relationshipId: string, data: CheckInInput) {
    return api.post<CheckIn>(`/discipleship/${relationshipId}/check-ins`, data);
  },
};
