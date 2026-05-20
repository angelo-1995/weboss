'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuditFiltersStore } from '../stores/audit-filters.store';

const ACTIONS = [
  { value: '', label: 'Todas las acciones' },
  { value: 'CREATE', label: 'CREATE' },
  { value: 'READ', label: 'READ' },
  { value: 'UPDATE', label: 'UPDATE' },
  { value: 'DELETE', label: 'DELETE' },
];

const RESOURCES = [
  { value: '', label: 'Todos los recursos' },
  { value: 'users', label: 'Usuarios' },
  { value: 'groups', label: 'Grupos' },
  { value: 'sermons', label: 'Predicaciones' },
  { value: 'networks', label: 'Redes' },
  { value: 'invitations', label: 'Invitaciones' },
  { value: 'discipleship', label: 'Discipulado' },
  { value: 'memberships', label: 'Membresías' },
  { value: 'reports', label: 'Informes' },
];

export function AuditFilterBar() {
  const {
    action,
    resource,
    dateFrom,
    dateTo,
    userSearch,
    setAction,
    setResource,
    setDateFrom,
    setDateTo,
    setUserSearch,
    clearFilters,
  } = useAuditFiltersStore();

  const hasFilters = action || resource || dateFrom || dateTo || userSearch;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Action select */}
      <select
        value={action}
        onChange={(e) => setAction(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {ACTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Resource select */}
      <select
        value={resource}
        onChange={(e) => setResource(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {RESOURCES.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Date from */}
      <Input
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        placeholder="Desde"
        className="h-9 w-[150px]"
      />

      {/* Date to */}
      <Input
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        placeholder="Hasta"
        className="h-9 w-[150px]"
      />

      {/* User search */}
      <Input
        type="text"
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
        placeholder="Buscar usuario..."
        className="h-9 w-[180px]"
      />

      {/* Clear filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 px-2">
          <X className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
