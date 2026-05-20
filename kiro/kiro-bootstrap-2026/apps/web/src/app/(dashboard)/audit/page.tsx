'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { AuditTable } from '@/features/audit/components/audit-table';
import { AuditFilterBar } from '@/features/audit/components/audit-filter-bar';
import { AuditDetailPanel } from '@/features/audit/components/audit-detail-panel';
import { useAuditLogs } from '@/features/audit/hooks/use-audit-logs';
import { useAuditFiltersStore } from '@/features/audit/stores/audit-filters.store';
import type { AuditLog } from '@/features/audit/types/audit.types';

export default function AuditPage() {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const { action, resource, dateFrom, dateTo, userSearch } = useAuditFiltersStore();

  const { data, isLoading } = useAuditLogs({
    action: action || undefined,
    resource: resource || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    userId: userSearch || undefined,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Registro de Auditoría"
        description="Historial de acciones realizadas en el sistema"
      />

      <AuditFilterBar />

      <AuditTable
        data={data?.items ?? []}
        isLoading={isLoading}
        onRowClick={(log) => setSelectedLog(log)}
      />

      {selectedLog && (
        <AuditDetailPanel
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}
