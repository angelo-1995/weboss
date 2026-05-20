'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import Link from 'next/link';

interface PipelineStats {
  GANADO: number;
  CONSOLIDADO: number;
  DISCIPULADO: number;
  ENVIADO: number;
}

export function AdminDashboard() {
  const [pipelineStats, setPipelineStats] = useState<PipelineStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const stats = await api.get<PipelineStats>('/users/pipeline');
        setPipelineStats(stats);
      } catch (err) {
        console.error('Error loading admin dashboard:', err);
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
      {/* Pipeline Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Pipeline Espiritual</h2>
          <Link href="/pipeline" className="text-sm text-primary hover:underline">
            Ver completo →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {pipelineStats && (
            <>
              <FunnelCard label="Ganados" count={pipelineStats.GANADO} color="bg-green-500" />
              <FunnelCard label="Consolidados" count={pipelineStats.CONSOLIDADO} color="bg-blue-500" />
              <FunnelCard label="Discipulado" count={pipelineStats.DISCIPULADO} color="bg-purple-500" />
              <FunnelCard label="Enviados" count={pipelineStats.ENVIADO} color="bg-amber-500" />
            </>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href="/reports"
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <p className="text-sm font-medium">Reportes Pendientes</p>
            <p className="text-xs text-muted-foreground mt-1">Revisar informes de células</p>
          </Link>
          <Link
            href="/users"
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <p className="text-sm font-medium">Gestionar Usuarios</p>
            <p className="text-xs text-muted-foreground mt-1">Administrar miembros</p>
          </Link>
          <Link
            href="/analytics"
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <p className="text-sm font-medium">Analíticas</p>
            <p className="text-xs text-muted-foreground mt-1">Ver métricas de crecimiento</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function FunnelCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold">{count}</p>
    </div>
  );
}
