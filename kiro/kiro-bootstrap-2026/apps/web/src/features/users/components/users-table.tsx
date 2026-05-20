'use client';

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { useUsers } from '../hooks/use-users';
import type { UserProfile } from '@community-os/types';

const columns: ColumnDef<UserProfile>[] = [
  {
    accessorKey: 'firstName',
    header: 'Nombre',
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.firstName} {row.original.lastName}
      </span>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ getValue }) => {
      const status = getValue<string>();
      const colors: Record<string, string> = {
        ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
        SUSPENDED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      };
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? ''}`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: 'roles',
    header: 'Roles',
    cell: ({ getValue }) => {
      const roles = getValue<string[]>();
      return <span className="text-sm text-muted-foreground">{roles.join(', ')}</span>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Creado',
    cell: ({ getValue }) =>
      new Date(getValue<string>()).toLocaleDateString('es', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
  },
];

interface UsersTableProps {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export function UsersTable({ search, status, page = 1, pageSize = 20 }: UsersTableProps) {
  const { data, isLoading, isError } = useUsers({ search, status, page, pageSize });

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: data?.meta.total ?? 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        Cargando usuarios...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12 text-destructive text-sm">
        Error al cargar usuarios
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left font-medium text-muted-foreground"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-muted/30 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {data?.meta && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
          <span>
            {data.meta.total} usuario{data.meta.total !== 1 ? 's' : ''}
          </span>
          <span>
            Página {data.meta.page} de {Math.ceil(data.meta.total / data.meta.pageSize) || 1}
          </span>
        </div>
      )}
    </div>
  );
}
