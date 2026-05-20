'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { useGroup } from '@/features/groups/hooks/use-groups';
import { GroupMembersTable } from '@/features/groups/components/group-members-table';
import { AddMemberModal } from '@/features/groups/components/add-member-modal';
import { EditGroupModal } from '@/features/groups/components/edit-group-modal';
import { groupsService } from '@/features/groups/services/groups.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';

const TYPE_LABELS: Record<string, string> = {
  CELL: 'Célula',
  MINISTRY: 'Ministerio',
  CAMPUS: 'Campus',
  DEPARTMENT: 'Departamento',
  TEAM: 'Equipo',
  SPECIAL: 'Especial',
};

const TYPE_COLORS: Record<string, string> = {
  CELL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  MINISTRY: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  CAMPUS: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  DEPARTMENT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  TEAM: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  SPECIAL: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
};

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const [addMemberOpen, setAddMemberOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const { data: group, isLoading } = useGroup(groupId);
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!accessToken) return;
    setDeleting(true);
    try {
      await groupsService.remove(accessToken, groupId);
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
      router.push('/groups');
    } catch {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Grupo no encontrado
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={group.name} description={group.description}>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[group.type] ?? ''}`}
        >
          {TYPE_LABELS[group.type] ?? group.type}
        </span>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
        <Button onClick={() => setAddMemberOpen(true)}>
          <Plus className="h-4 w-4" />
          Agregar Miembro
        </Button>
      </PageHeader>

      <GroupMembersTable groupId={groupId} />

      <AddMemberModal
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        groupId={groupId}
      />

      <EditGroupModal
        open={editOpen}
        onOpenChange={setEditOpen}
        group={group}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar grupo"
        description="¿Estás seguro de que deseas eliminar este grupo? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel={deleting ? 'Eliminando...' : 'Eliminar grupo'}
        cancelLabel="Cancelar"
      />
    </div>
  );
}
