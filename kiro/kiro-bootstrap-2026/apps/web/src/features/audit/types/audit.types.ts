export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: { id: string; firstName: string; lastName: string; email: string } | null;
}

export interface PaginatedAuditLogs {
  items: AuditLog[];
  nextCursor: string | null;
  total: number;
}

export interface AuditLogFilters {
  cursor?: string;
  limit?: number;
  userId?: string;
  action?: string;
  resource?: string;
  dateFrom?: string;
  dateTo?: string;
}
