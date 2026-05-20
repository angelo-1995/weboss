'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { Button } from '@/components/ui/button';
import { CreateGroupModal } from '@/features/groups/components/create-group-modal';
import { useGroups } from '@/features/groups/hooks/use-groups';

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

function GroupCard({ group, onClick }: { group: any; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-border bg-card p-4 space-y-3 hover:border-ring/50 transition-colors text-left w-full"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-medium text-sm leading-tight truncate">{group.name}</h3>
          {group.code && (
            <span className="shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono bg-muted text-muted-foreground">
              {group.code}
            </span>
          )}
        </div>
        <span
          className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[group.type] ?? ''}`}
        >
          {TYPE_LABELS[group.type] ?? group.type}
        </span>
      </div>

      {group.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{group.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{group.memberCount ?? group._count?.members ?? 0} miembros</span>
        {group.leaderName && (
          <span className="truncate ml-2">Líder: {group.leaderName}</span>
        )}
      </div>
    </button>
  );
}

export default function GroupsPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string | undefined>();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useGroups({
    search: debouncedSearch || undefined,
    type: typeFilter,
    pageSize: 50,
  });

  return (
    <div className="space-y-4">
      <PageHeader title="Grupos" description="Células, ministerios y equipos de la organización">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Crear Grupo
        </Button>
      </PageHeader>

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar grupo..."
        filters={
          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            value={typeFilter ?? ''}
            onChange={(e) => setTypeFilter(e.target.value || undefined)}
          >
            <option value="">Todos los tipos</option>
            <option value="CELL">Célula</option>
            <option value="MINISTRY">Ministerio</option>
            <option value="TEAM">Equipo</option>
            <option value="DEPARTMENT">Departamento</option>
            <option value="CAMPUS">Campus</option>
          </select>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 h-28 animate-pulse" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No se encontraron grupos</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => router.push(`/groups/${group.id}` as any)}
            />
          ))}
        </div>
      )}

      <CreateGroupModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
