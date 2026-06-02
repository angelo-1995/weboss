import type { BaseEntity, Status, UUID } from './common.types';

export type GroupType = 'CELL' | 'MINISTRY' | 'CAMPUS' | 'DEPARTMENT' | 'TEAM';

export type GroupMemberRole = 'LEADER' | 'CO_LEADER' | 'MEMBER' | 'GUEST';

export interface Group extends BaseEntity {
  name: string;
  slug: string;
  code?: string;
  description?: string;
  type: GroupType;
  isActive: boolean;
  status: Status;
  parentId?: UUID;
  campusId?: UUID;
  networkId?: UUID;
  leaderId?: UUID;
  memberCount: number;
}

export interface GroupMember extends BaseEntity {
  groupId: UUID;
  userId: UUID;
  role: GroupMemberRole;
  joinedAt: string;
}
