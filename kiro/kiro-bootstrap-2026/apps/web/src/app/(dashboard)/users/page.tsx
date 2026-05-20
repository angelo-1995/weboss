'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { Button } from '@/components/ui/button';
import { CreateUserModal } from '@/features/users/components/create-user-modal';
import { BulkNetworkAssign } from '@/features/users/components/bulk-network-assign';
import { useUsers } from '@/features/users/hooks/use-users';
import type { ColumnDef } from '@tanstack/react-table';
import type { UserProfile } from '@community-os/types';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const STAGE_COLORS: Record<string, string> = {
  NEW_BELIEVER: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  CONSOLIDATION: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  DISCIPLESHIP: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  LEADERSHIP: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  MINISTRY: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

const STAGE_LABELS: Record<string, string> = {
  NEW_BELIEVER: 'Nuevo',
  CONSOLIDATION: 'Consolidación',
  DISCIPLESHIP: 'Discipulado',
  LEADERSHIP: 'Liderazgo',
  MINISTRY: 'Ministerio',
};

// Extended type to include network relation from API
interface UserWithNetwork extends UserProfile {
  leaderCode?: string | null;
  spiritualStage?: string | null;
  ministerialRole?: string | null;
  network?: { id: string; name: string; code: string } | null;
  networkId?: string | null;
}

const MINISTERIAL_ROLE_LABELS: Record<string, string> = {
  PASTOR_GENERAL: 'Pastor General',
  PASTOR_RED: 'Pastor de Red',
  COBERTURA: 'Cobertura',
  LIDER: 'Líder',
  ESTACA: 'Estaca',
  MIEMBRO: 'Miembro',
};

const MINISTERIAL_ROLE_COLORS: Record<string, string> = {
  PASTOR_GENERAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  PASTOR_RED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  COBERTURA: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  LIDER: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  ESTACA: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  MIEMBRO: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function UsersPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [bulkNetworkOpen, setBulkNetworkOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string | undefined>();
  const [page, setPage] = React.useState(1);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useUsers({
    search: debouncedSearch || undefined,
    status: statusFilter,
    page,
    pageSize: 20,
  });

  const columns: ColumnDef<UserWithNetwork>[] = [
    {
      accessorKey: 'firstName',
      header: 'Nombre',
      cell: ({ row }) => (
        <span className="font-medium text-sm">
          {row.original.firstName} {row.original.lastName}
        </span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground hidden md:inline">
          {getValue<string>()}
        </span>
      ),
      meta: { className: 'hidden md:table-cell' },
    },
    {
      accessorKey: 'spiritualStage',
      header: 'Etapa',
      cell: ({ getValue }) => {
        const stage = getValue<string | null>();
        if (!stage) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STAGE_COLORS[stage] ?? 'bg-gray-100 text-gray-800'}`}
          >
            {STAGE_LABELS[stage] ?? stage}
          </span>
        );
      },
    },
    {
      accessorKey: 'network',
      header: 'Red',
      cell: ({ row }) => {
        const network = row.original.network;
        if (!network) return <span className="text-xs text-muted-foreground">—</span>;
        return <span className="text-sm">{network.name}</span>;
      },
      meta: { className: 'hidden lg:table-cell' },
    },
    {
      accessorKey: 'leaderCode',
      header: 'Código',
      cell: ({ getValue }) => {
        const code = getValue<string | null>();
        if (!code) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono bg-muted">
            {code}
          </span>
        );
      },
      meta: { className: 'hidden lg:table-cell' },
    },
    {
      accessorKey: 'roles',
      header: 'Rol',
      cell: ({ row }) => {
        const ministerial = row.original.ministerialRole;
        const roles = row.original.roles;
        return (
          <div className="flex flex-col gap-0.5">
            {ministerial ? (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${MINISTERIAL_ROLE_COLORS[ministerial] ?? 'bg-gray-100 text-gray-800'}`}>
                {MINISTERIAL_ROLE_LABELS[ministerial] ?? ministerial}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
            <span className="text-[10px] text-muted-foreground">{roles?.[0] ?? ''}</span>
          </div>
        );
      },
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ getValue }) => {
        const status = getValue<string>();
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? ''}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/users/${row.original.id}`);
          }}
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          Ver
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Usuarios" description="Gestión de personas en la organización">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBulkNetworkOpen(true)}>
            Asignar Red
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuevo Miembro
          </Button>
        </div>
      </PageHeader>

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre o email..."
        filters={
          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            value={statusFilter ?? ''}
            onChange={(e) => {
              setStatusFilter(e.target.value || undefined);
              setPage(1);
            }}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="pending">Pendiente</option>
            <option value="suspended">Suspendido</option>
          </select>
        }
      />

      <DataTable
        columns={columns}
        data={(data?.data as UserWithNetwork[]) ?? []}
        isLoading={isLoading}
        onRowClick={(row) => router.push(`/users/${row.id}`)}
        emptyMessage="No se encontraron usuarios"
      />

      <DataTablePagination
        hasMore={data?.meta.hasNextPage ?? false}
        hasPrev={data?.meta.hasPrevPage ?? false}
        onNext={() => setPage((p) => p + 1)}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
      />

      <CreateUserModal open={createOpen} onOpenChange={setCreateOpen} />
      <BulkNetworkAssign open={bulkNetworkOpen} onClose={() => setBulkNetworkOpen(false)} />
    </div>
  );
}
