export interface Invitation {
  id: string;
  email: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  invitedById: string;
  groupId: string | null;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  invitedBy?: { id: string; firstName: string; lastName: string };
  group?: { id: string; name: string } | null;
}

export interface PaginatedInvitations {
  items: Invitation[];
  nextCursor: string | null;
  total: number;
}

export interface CreateInvitationDto {
  email: string;
  groupId?: string;
}
