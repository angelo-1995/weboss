'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import Link from 'next/link';

interface GroupInfo {
  id: string;
  name: string;
  _count?: { members: number };
}

export function LeaderDashboard() {
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [pipelineStats, setPipelineStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, groupsRes] = await Promise.all([
          api.get<Record<string, number>>('/users/pipeline'),
          api.get<{ data: GroupInfo[] }>('/groups', { page: 1, pageSize: 10 }),
        ]);
        setPipelineStats(statsRes);
        setGroups(groupsRes.data || []);
      } catch (err) {
        console.error('Error loading leader dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-32 bg-muted rounded-lg" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* My Pipeline */}
      {pipelineStats && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Mi Pipeline</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Ganados" value={pipelineStats.GANADO || 0} />
            <StatCard label="Consolidados" value={pipelineStats.CONSOLIDADO || 0} />
            <StatCard label="Discipulado" value={pipelineStats.DISCIPULADO || 0} />
            <StatCard label="Enviados" value={pipelineStats.ENVIADO || 0} />
          </div>
        </div>
      )}

      {/* My Cells */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Mis Células</h2>
          <Link href="/groups" className="text-sm text-primary hover:underline">
            Ver todas →
          </Link>
        </div>
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tienes células asignadas</p>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-medium">{g.name}</span>
                <span className="text-xs text-muted-foreground">
                  {g._count?.members ?? 0} miembros
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href="/reports"
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <p className="text-sm font-medium">Enviar Reporte</p>
            <p className="text-xs text-muted-foreground mt-1">Reportar reunión de célula</p>
          </Link>
          <Link
            href="/pipeline"
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <p className="text-sm font-medium">Pipeline Espiritual</p>
            <p className="text-xs text-muted-foreground mt-1">Promover discípulos</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-lg p-3 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
