'use client';

import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, BarChart3 } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteSermon } from '../hooks/use-sermon-mutations';
import type { Sermon } from '../types/sermon.types';

const STATUS_CONFIG: Record<Sermon['status'], { label: string; className: string }> = {
  PUBLISHED: {
    label: 'Publicada',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200',
  },
  SCHEDULED: {
    label: 'Programada',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200',
  },
  DRAFT: {
    label: 'Borrador',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200',
  },
};

function ActionsCell({ sermon }: { sermon: Sermon }) {
  const router = useRouter();
  const deleteMutation = useDeleteSermon();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true as any}>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/sermons/admin/${sermon.id}/edit` as any)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/sermons/admin/${sermon.id}/analytics` as any)}>
          <BarChart3 className="mr-2 h-4 w-4" />
          Analytics
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => {
            if (confirm('¿Estás seguro de eliminar esta predicación?')) {
              deleteMutation.mutate(sermon.id);
            }
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columns: ColumnDef<Sermon, unknown>[] = [
  {
    accessorKey: 'title',
    header: 'Título',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.title}</span>
    ),
  },
  {
    accessorKey: 'sermonDate',
    header: 'Fecha',
    cell: ({ row }) => new Date(row.original.sermonDate).toLocaleDateString('es-PA'),
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
    id: 'views',
    header: 'Vistas',
    cell: ({ row }) => row.original._count?.views ?? 0,
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => <ActionsCell sermon={row.original} />,
  },
];

interface SermonAdminTableProps {
  data: Sermon[];
  isLoading?: boolean;
}

export function SermonAdminTable({ data, isLoading }: SermonAdminTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyMessage="No hay predicaciones registradas."
    />
  );
}
