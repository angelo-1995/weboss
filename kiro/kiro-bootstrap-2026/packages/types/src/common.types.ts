export type UUID = string;

export type Timestamp = string; // ISO 8601

export interface BaseEntity {
  id: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp | null;
}

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  order: SortOrder;
}

export type Status = 'active' | 'inactive' | 'suspended' | 'pending';
