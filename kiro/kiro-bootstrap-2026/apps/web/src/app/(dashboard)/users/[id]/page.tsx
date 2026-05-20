'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { UserProfileTabs } from '@/features/users/components/user-profile-tabs';
import { OrgConfigSection } from '@/features/users/components/org-config-section';
import { MilestoneBadges } from '@/features/users/components/milestone-badges';
import { usersService } from '@/features/users/services/users.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const MINISTERIAL_ROLE_LABELS: Record<string, string> = {
  PASTOR_GENERAL: 'Pastor General',
  PASTOR_RED: 'Pastor de Red',
  COBERTURA: 'Cobertura',
  LIDER: 'Líder',
  ESTACA: 'Estaca',
  MIEMBRO: 'Miembro',
};

const MINISTERIAL_ROLE_COLORS: Record<string, string> = {
  PASTOR_GENERAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  PASTOR_RED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  COBERTURA: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  LIDER: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  ESTACA: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  MIEMBRO: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const { accessToken, user: currentUser } = useAuthStore();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    if (!accessToken || !params.id) return;
    try {
      setLoading(true);
      const data = await usersService.findById(accessToken, params.id);
      setUser(data as unknown as Record<string, unknown>);
    } catch (err) {
      setError('Error al cargar el usuario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">{error ?? 'Usuario no encontrado'}</p>
      </div>
    );
  }

  const firstName = (user.firstName as string) ?? '';
  const lastName = (user.lastName as string) ?? '';
  const leaderCode = (user.leaderCode as string) ?? null;
  const spiritualStage = (user.spiritualStage as string) ?? null;
  const ministerialRole = (user.ministerialRole as string) ?? null;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const leader = user.leader as { id: string; firstName: string; lastName: string; leaderCode?: string } | null;
  const groups = (user.groups as { role: string; group: { id: string; name: string; code?: string; type: string } }[]) ?? [];
  const network = user.network as { id: string; name: string; code: string } | null;
  const subordinateCount = (user.subordinateCount as number) ?? 0;
  const profile = user.profile as { birthDate?: string } | null;

  let age: number | null = null;
  if (profile?.birthDate) {
    const birth = new Date(profile.birthDate);
    const today = new Date();
    age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
  }

  const stageLabels: Record<string, string> = {
    GANADO: 'Ganado',
    CONSOLIDADO: 'Consolidado',
    DISCIPULADO: 'Discipulado',
    ENVIADO: 'Enviado',
  };

  const stageColors: Record<string, string> = {
    GANADO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    CONSOLIDADO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    DISCIPULADO: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    ENVIADO: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  };

  const primaryGroup = groups.find(g => g.role === 'LEADER') ?? groups.find(g => g.role === 'MEMBER') ?? groups[0];

  return (
    <div className="space-y-6">
      <PageHeader title={`${firstName} ${lastName}`} />

      {/* Resumen Card */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-semibold">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-semibold">{firstName} {lastName}</h2>
              {age !== null && (
                <span className="text-sm text-muted-foreground">{age} años</span>
              )}
              {leaderCode && (
                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-mono">
                  {leaderCode}
                </span>
              )}
              {spiritualStage && (
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${stageColors[spiritualStage] ?? 'bg-muted text-muted-foreground'}`}>
                  {stageLabels[spiritualStage] || spiritualStage}
                </span>
              )}
              {ministerialRole && (
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${MINISTERIAL_ROLE_COLORS[ministerialRole] ?? 'bg-muted text-muted-foreground'}`}>
                  {MINISTERIAL_ROLE_LABELS[ministerialRole] || ministerialRole}
                </span>
              )}
            </div>

            {/* Milestone Badges */}
            <MilestoneBadges userId={params.id} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {leader && (
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Cobertura:</span>{' '}
                  Bajo la cobertura de {leader.firstName} {leader.lastName}
                  {leader.leaderCode && <span className="text-xs ml-1">({leader.leaderCode})</span>}
                </div>
              )}

              {primaryGroup && (
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Célula:</span>{' '}
                  Asignado a:{' '}
                  <a href={`/groups/${primaryGroup.group.id}`} className="text-primary hover:underline">
                    {primaryGroup.group.name}
                    {primaryGroup.group.code && <span className="text-xs ml-1">({primaryGroup.group.code})</span>}
                  </a>
                </div>
              )}

              {network && (
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Red:</span>{' '}
                  {network.name}
                </div>
              )}

              {subordinateCount > 0 && (
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Personas bajo liderazgo:</span>{' '}
                  {subordinateCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Configuración Organizacional — collapsed by default, editable for admins */}
      <OrgConfigSection
        userId={params.id}
        leaderCode={leaderCode}
        ministerialRole={ministerialRole}
        leaderId={(user.leaderId as string) ?? null}
        leaderName={leader ? `${leader.firstName} ${leader.lastName}` : null}
        networkId={(user.networkId as string) ?? null}
        networkName={network?.name ?? null}
        spiritualStage={spiritualStage}
        hasLaunch={(user.hasLaunch as boolean) ?? false}
        onSaved={fetchUser}
      />

      {/* Tabs (includes Hitos tab) */}
      <UserProfileTabs user={user} onUpdate={fetchUser} />
    </div>
  );
}
