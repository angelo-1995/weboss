'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { Search, Plus, ChevronRight, User2 } from 'lucide-react';
import Link from 'next/link';

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  pipelineStage: { id: string; name: string; code: string; color: string } | null;
  currentGroup: { id: string; name: string; code: string } | null;
}

interface PersonsResponse {
  data: Person[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export default function PersonasPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; totalPages: number }>({ total: 0, page: 1, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const loadPersons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      const res = await api.get<PersonsResponse>(`/persons?${params}`);
      setPersons(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error('Error loading persons:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(loadPersons, 300);
    return () => clearTimeout(timer);
  }, [loadPersons]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading tracking-tight">Personas</h1>
          <p className="text-sm text-muted-foreground">Todos los miembros del ministerio — tengan o no acceso al sistema. {meta.total} registrados.</p>
        </div>
        <Link
          href={'/personas/new' as any}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Persona
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : persons.length === 0 ? (
        <div className="text-center py-12 border rounded-xl">
          <User2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">
            {search ? 'No se encontraron personas con ese criterio' : 'Aún no hay personas registradas'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? 'Intenta con otro término' : 'Comienza agregando visitantes'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {persons.map((person) => (
            <Link
              key={person.id}
              href={`/personas/${person.id}` as any}
              className="flex items-center gap-4 p-4 border rounded-xl hover:bg-muted/50 transition-colors group"
            >
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {person.avatarUrl ? (
                  <img src={person.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-primary">
                    {person.firstName[0]}{person.lastName[0]}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {person.firstName} {person.lastName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {person.currentGroup && (
                    <span className="text-xs text-muted-foreground">
                      📍 {person.currentGroup.code} ({person.currentGroup.name})
                    </span>
                  )}
                  {person.phone && (
                    <span className="text-xs text-muted-foreground">
                      📱 {person.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Stage Badge */}
              {person.pipelineStage && (
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                  style={{
                    backgroundColor: `${person.pipelineStage.color}20`,
                    color: person.pipelineStage.color,
                  }}
                >
                  {person.pipelineStage.name}
                </span>
              )}

              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50"
          >
            ← Anterior
          </button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
