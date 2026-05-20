'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useResendInvitation } from '../hooks/use-invitations';
import type { Invitation } from '../types/invitation.types';

const STATUS_CONFIG: Record<Invitation['status'], { label: string; className: string }> = {
  PENDING: {
    label: 'Pendiente',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200',
  },
  ACCEPTED: {
    label: 'Aceptada',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200',
  },
  EXPIRED: {
    label: 'Expirada',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200',
  },
  CANCELLED: {
    label: 'Cancelada',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200',
  },
};

function ActionsCell({ invitation }: { invitation: Invitation }) {
  const resendMutation = useResendInvitation();

  if (invitation.status !== 'PENDING') return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 text-xs"
      disabled={resendMutation.isPending}
      onClick={() => {
        resendMutation.mutate(invitation.id, {
          onSuccess: () => toast.success('Invitación reenviada exitosamente'),
          onError: () => toast.error('Error al reenviar la invitación'),
        });
      }}
    >
      <RotateCw className="h-3.5 w-3.5 mr-1" />
      Reenviar
    </Button>
  );
}

const columns: ColumnDef<Invitation, unknown>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <span className="font-medium text-sm">{row.original.email}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => {
      const config = STATUS_CONFIG[row.original.status];
      return <Badge className={config.className}>{config.label}</Badge>;
    },
  },
  {
    id: 'group',
    header: 'Grupo',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.group?.name ?? '—'}
      </span>
    ),
  },
  {
    id: 'invitedBy',
    header: 'Invitado por',
    cell: ({ row }) => {
      const inviter = row.original.invitedBy;
      if (!inviter) return <span className="text-sm text-muted-foreground">—</span>;
      return (
        <span className="text-sm">
          {inviter.firstName} {inviter.lastName}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Fecha',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString('es-PA')}
      </span>
    ),
  },
  {
    accessorKey: 'expiresAt',
    header: 'Expira',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.expiresAt).toLocaleDateString('es-PA')}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => <ActionsCell invitation={row.original} />,
  },
];

interface InvitationsTableProps {
  data: Invitation[];
  isLoading?: boolean;
}

export function InvitationsTable({ data, isLoading }: InvitationsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyMessage="No hay invitaciones registradas."
    />
  );
}
