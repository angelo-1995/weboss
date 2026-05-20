import type { BaseEntity, Status, UUID } from './common.types';

export type GroupType = 'CELL' | 'MINISTRY' | 'CAMPUS' | 'DEPARTMENT' | 'TEAM';

export type GroupMemberRole = 'LEADER' | 'CO_LEADER' | 'MEMBER' | 'GUEST';

export interface Group extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  type: GroupType;
  status: Status;
  parentId?: UUID;
  campusId?: UUID;
  leaderId?: UUID;
  memberCount: number;
}

export interface GroupMember extends BaseEntity {
  groupId: UUID;
  userId: UUID;
  role: GroupMemberRole;
  joinedAt: string;
}
