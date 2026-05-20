'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import Link from 'next/link';

const STAGE_LABELS: Record<string, string> = {
  GANADO: 'Ganado',
  CONSOLIDADO: 'Consolidado',
  DISCIPULADO: 'En Discipulado',
  ENVIADO: 'Enviado (Líder)',
};

interface UserProfile {
  id: string;
  spiritualStage: string | null;
  leaderCode: string | null;
}

export function MemberDashboard() {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<UserProfile>('/users/me');
        setProfile(res);
      } catch (err) {
        console.error('Error loading member dashboard:', err);
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
      {/* My Stage */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Mi Progreso Espiritual</h2>
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-muted-foreground">
                Etapa: {profile?.spiritualStage ? STAGE_LABELS[profile.spiritualStage] || profile.spiritualStage : 'Sin asignar'}
              </p>
              {profile?.leaderCode && (
                <span className="inline-block mt-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-mono">
                  {profile.leaderCode}
                </span>
              )}
            </div>
          </div>

          {/* Stage Progress Bar */}
          {profile?.spiritualStage && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Ganado</span>
                <span>Consolidado</span>
                <span>Discipulado</span>
                <span>Enviado</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                <div className={`h-full ${getProgressWidth(profile.spiritualStage)} bg-primary transition-all`} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Mis Accesos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href="/groups"
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <p className="text-sm font-medium">Mis Grupos</p>
            <p className="text-xs text-muted-foreground mt-1">Ver células y ministerios</p>
          </Link>
          <Link
            href="/discipleship"
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <p className="text-sm font-medium">Mi Discipulado</p>
            <p className="text-xs text-muted-foreground mt-1">Progreso y sesiones</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function getProgressWidth(stage: string): string {
  switch (stage) {
    case 'GANADO': return 'w-1/4';
    case 'CONSOLIDADO': return 'w-2/4';
    case 'DISCIPULADO': return 'w-3/4';
    case 'ENVIADO': return 'w-full';
    default: return 'w-0';
  }
}
