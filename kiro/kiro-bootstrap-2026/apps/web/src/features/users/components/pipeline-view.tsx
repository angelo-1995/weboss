'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { PromoteUserModal } from './promote-user-modal';

interface PipelineUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  leaderCode: string | null;
  spiritualStage: string | null;
  createdAt: string;
}

interface StageColumn {
  key: string;
  label: string;
  color: string;
  bgColor: string;
  users: PipelineUser[];
  count: number;
}

const STAGES: { key: string; label: string; color: string; bgColor: string }[] = [
  { key: 'GANADO', label: 'Ganado', color: 'bg-green-500', bgColor: 'bg-green-50 dark:bg-green-950/30' },
  { key: 'CONSOLIDADO', label: 'Consolidado', color: 'bg-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  { key: 'DISCIPULADO', label: 'Discipulado', color: 'bg-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
  { key: 'ENVIADO', label: 'Enviado', color: 'bg-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
];

const NEXT_STAGE: Record<string, string> = {
  GANADO: 'CONSOLIDADO',
  CONSOLIDADO: 'DISCIPULADO',
  DISCIPULADO: 'ENVIADO',
};

export function PipelineView() {
  const [columns, setColumns] = useState<StageColumn[]>([]);
  const [unassigned, setUnassigned] = useState<PipelineUser[]>([]);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [promoteTarget, setPromoteTarget] = useState<PipelineUser | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const fetchPipeline = useCallback(async () => {
    try {
      const [stats, unassignedRes] = await Promise.all([
        api.get<Record<string, number>>('/users/pipeline'),
        api.get<{ data: PipelineUser[]; meta: { total: number } }>('/users/pipeline/unassigned'),
      ]);

      setUnassigned(unassignedRes.data);
      setUnassignedCount(unassignedRes.meta.total);

      const cols: StageColumn[] = await Promise.all(
        STAGES.map(async (stage) => {
          const res = await api.get<{ data: PipelineUser[] }>(`/users/pipeline/${stage.key}`);
          return {
            ...stage,
            users: res.data,
            count: stats[stage.key] || 0,
          };
        }),
      );
      setColumns(cols);
    } catch (err) {
      console.error('Error fetching pipeline:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const handlePromoteSuccess = () => {
    setPromoteTarget(null);
    // Re-fetch pipeline data immediately to reflect the promotion
    setLoading(true);
    fetchPipeline();
  };

  const handleAssignStage = async (userId: string) => {
    setAssigningId(userId);
    try {
      await api.post(`/users/${userId}/assign-stage`, { stage: 'GANADO' });
      fetchPipeline();
    } catch (err) {
      console.error('Error assigning stage:', err);
    } finally {
      setAssigningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Unassigned Users Section */}
      {unassigned.length > 0 && (
        <div className="mb-6">
          <div className="rounded-lg border border-dashed border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                Personas sin etapa asignada
              </h3>
              <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 rounded-full px-2 py-0.5">
                {unassignedCount}
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {unassigned.map((user) => (
                <div
                  key={user.id}
                  className="min-w-[200px] bg-card rounded-md border p-3 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('es')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssignStage(user.id)}
                    disabled={assigningId === user.id}
                    className="mt-2 w-full text-xs bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 font-medium py-1.5 rounded transition-colors disabled:opacity-50"
                  >
                    {assigningId === user.id ? 'Asignando...' : 'Asignar etapa → Ganado'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.key} className="min-w-[280px] flex-1">
            {/* Column Header */}
            <div className={`rounded-t-lg px-4 py-3 ${col.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{col.label}</h3>
                <span className="text-xs font-medium text-white/80 bg-white/20 rounded-full px-2 py-0.5">
                  {col.count}
                </span>
              </div>
            </div>

            {/* Column Body */}
            <div className={`rounded-b-lg border border-t-0 p-2 space-y-2 min-h-[200px] ${col.bgColor}`}>
              {col.users.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Sin personas en esta etapa
                </p>
              )}
              {col.users.map((user) => (
                <div
                  key={user.id}
                  className="bg-card rounded-md border p-3 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('es')}
                      </p>
                    </div>
                  </div>
                  {user.leaderCode && col.key === 'ENVIADO' && (
                    <span className="inline-block mt-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-mono">
                      {user.leaderCode}
                    </span>
                  )}
                  {NEXT_STAGE[col.key] && (
                    <button
                      onClick={() => setPromoteTarget(user)}
                      className="mt-2 w-full text-xs bg-primary/10 hover:bg-primary/20 text-primary font-medium py-1.5 rounded transition-colors"
                    >
                      Promover →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {promoteTarget && (
        <PromoteUserModal
          open={!!promoteTarget}
          onOpenChange={(v) => { if (!v) setPromoteTarget(null); }}
          user={promoteTarget}
          onSuccess={handlePromoteSuccess}
        />
      )}
    </>
  );
}
