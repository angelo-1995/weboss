'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import type { AuditLog } from '../types/audit.types';

const ACTION_CONFIG: Record<string, { label: string; className: string }> = {
  CREATE: {
    label: 'CREATE',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200',
  },
  READ: {
    label: 'READ',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200',
  },
  UPDATE: {
    label: 'UPDATE',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
  },
  DELETE: {
    label: 'DELETE',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200',
  },
};

const columns: ColumnDef<AuditLog, unknown>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Fecha/Hora',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {new Date(row.original.createdAt).toLocaleString('es-PA', {
          dateStyle: 'short',
          timeStyle: 'short',
        })}
      </span>
    ),
  },
  {
    id: 'user',
    header: 'Usuario',
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) return <span className="text-sm text-muted-foreground">Sistema</span>;
      return (
        <span className="text-sm">
          {user.firstName} {user.lastName}
        </span>
      );
    },
  },
  {
    accessorKey: 'action',
    header: 'Acción',
    cell: ({ row }) => {
      const config = ACTION_CONFIG[row.original.action] ?? {
        label: row.original.action,
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200',
      };
      return <Badge className={config.className}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: 'resource',
    header: 'Recurso',
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.resource}</span>
    ),
  },
  {
    accessorKey: 'resourceId',
    header: 'ID Recurso',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground font-mono truncate max-w-[120px] inline-block">
        {row.original.resourceId ?? '—'}
      </span>
    ),
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground font-mono">
        {row.original.ipAddress ?? '—'}
      </span>
    ),
  },
];

interface AuditTableProps {
  data: AuditLog[];
  isLoading?: boolean;
  onRowClick?: (log: AuditLog) => void;
}

export function AuditTable({ data, isLoading, onRowClick }: AuditTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      onRowClick={onRowClick}
      emptyMessage="No hay registros de auditoría."
    />
  );
}
