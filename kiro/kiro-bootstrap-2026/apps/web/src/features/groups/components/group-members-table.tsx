'use client';

import * as React from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { Button } from '@/components/ui/button';
import { useGroupMembers, useRemoveMember } from '../hooks/use-groups';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { groupsService } from '../services/groups.service';
import type { ColumnDef } from '@tanstack/react-table';
import type { GroupMember } from '@community-os/types';

const ROLE_LABELS: Record<string, string> = {
  LEADER: 'Líder',
  CO_LEADER: 'Co-Líder',
  MEMBER: 'Miembro',
  GUEST: 'Invitado',
};

const ROLE_COLORS: Record<string, string> = {
  LEADER: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  CO_LEADER: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  MEMBER: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  GUEST: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

interface MemberWithUser extends GroupMember {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface GroupMembersTableProps {
  groupId: string;
}

export function GroupMembersTable({ groupId }: GroupMembersTableProps) {
  const [page, setPage] = React.useState(1);
  const [confirmRemove, setConfirmRemove] = React.useState<string | null>(null);
  const [removeError, setRemoveError] = React.useState<string | null>(null);

  const { data, isLoading } = useGroupMembers(groupId, { page, pageSize: 20 });
  const removeMember = useRemoveMember();
  const { accessToken } = useAuthStore();

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await groupsService.updateMemberRole(accessToken!, groupId, userId, newRole);
      // Refetch will happen via query invalidation
    } catch {
      // Handle error silently
    }
  };

  const handleRemove = async (userId: string) => {
    setRemoveError(null);
    try {
      await removeMember.mutateAsync({ groupId, userId });
      setConfirmRemove(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al remover miembro';
      if (message.toLowerCase().includes('leader') || message.toLowerCase().includes('líder')) {
        setRemoveError('No se puede remover al último líder del grupo');
      } else {
        setRemoveError(message);
      }
    }
  };

  const columns: ColumnDef<MemberWithUser>[] = [
    {
      accessorKey: 'user',
      header: 'Nombre',
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <span className="font-medium">
            {user ? `${user.firstName} ${user.lastName}` : row.original.userId}
          </span>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[role] ?? ''}`}
          >
            {ROLE_LABELS[role] ?? role}
          </span>
        );
      },
    },
    {
      accessorKey: 'joinedAt',
      header: 'Fecha Ingreso',
      cell: ({ getValue }) =>
        new Date(getValue<string>()).toLocaleDateString('es', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const member = row.original;
        const userId = member.user?.id ?? member.userId;

        return (
          <div className="flex items-center gap-2">
            <select
              className="h-7 rounded border border-input bg-transparent px-2 text-xs"
              value={member.role}
              onChange={(e) => handleRoleChange(userId, e.target.value)}
            >
              <option value="LEADER">Líder</option>
              <option value="CO_LEADER">Co-Líder</option>
              <option value="MEMBER">Miembro</option>
              <option value="GUEST">Invitado</option>
            </select>

            {confirmRemove === userId ? (
              <div className="flex items-center gap-1">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleRemove(userId)}
                  disabled={removeMember.isPending}
                >
                  Confirmar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setConfirmRemove(null);
                    setRemoveError(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={() => setConfirmRemove(userId)}
              >
                Remover
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">Miembros</h2>

      {removeError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {removeError}
        </div>
      )}

      <DataTable
        columns={columns}
        data={(data?.data as MemberWithUser[]) ?? []}
        isLoading={isLoading}
        emptyMessage="Este grupo no tiene miembros"
      />

      <DataTablePagination
        hasMore={data?.meta.hasNextPage ?? false}
        hasPrev={data?.meta.hasPrevPage ?? false}
        onNext={() => setPage((p) => p + 1)}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
      />
    </div>
  );
}
