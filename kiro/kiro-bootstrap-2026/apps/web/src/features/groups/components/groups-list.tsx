'use client';

import { useGroups } from '../hooks/use-groups';
import type { Group } from '@community-os/types';

const TYPE_LABELS: Record<string, string> = {
  CELL: 'Célula',
  MINISTRY: 'Ministerio',
  CAMPUS: 'Campus',
  DEPARTMENT: 'Departamento',
  TEAM: 'Equipo',
};

const TYPE_COLORS: Record<string, string> = {
  CELL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  MINISTRY: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  CAMPUS: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  DEPARTMENT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  TEAM: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
};

function GroupCard({ group }: { group: Group & { _count?: { members: number } } }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3 hover:border-ring/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="font-medium text-sm leading-tight">{group.name}</h3>
          <p className="text-xs text-muted-foreground">/{group.slug}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[group.type] ?? ''}`}>
          {TYPE_LABELS[group.type] ?? group.type}
        </span>
      </div>

      {group.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{group.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {(group as Group & { _count?: { members: number } })._count?.members ?? 0} miembros
        </span>
        <span className={group.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
          {group.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>
    </div>
  );
}

interface GroupsListProps {
  search?: string;
  type?: string;
  page?: number;
}

export function GroupsList({ search, type, page = 1 }: GroupsListProps) {
  const { data, isLoading, isError } = useGroups({ search, type, page, pageSize: 24 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive py-8 text-center">Error al cargar grupos</p>
    );
  }

  if (!data?.data.length) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">No se encontraron grupos</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.data.map((group) => (
          <GroupCard key={group.id} group={group as Group & { _count?: { members: number } }} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-right">
        {data.meta.total} grupo{data.meta.total !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
