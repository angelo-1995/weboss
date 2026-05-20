'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { PaginatedAuditLogs, AuditLogFilters } from '../types/audit.types';

const AUDIT_LOGS_KEY = 'audit-logs';

export function useAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: [AUDIT_LOGS_KEY, filters],
    queryFn: () =>
      api.get<PaginatedAuditLogs>('/audit-logs', filters as Record<string, unknown>),
    staleTime: 30_000,
  });
}
