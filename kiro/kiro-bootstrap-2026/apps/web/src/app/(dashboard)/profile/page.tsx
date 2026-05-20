'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { UserProfileTabs } from '@/features/users/components/user-profile-tabs';
import { OrgConfigSection } from '@/features/users/components/org-config-section';
import { MilestoneBadges } from '@/features/users/components/milestone-badges';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { api } from '@/lib/api-client';

export default function MyProfilePage() {
  const { user: authUser, accessToken } = useAuthStore();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    if (!accessToken) {
      setError('No hay sesión activa');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await api.get<any>('/auth/me');
      setUser(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar el perfil');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-destructive">{error || 'Error al cargar el perfil'}</p>
        <button onClick={fetchProfile} className="mt-2 text-sm text-primary hover:underline">
          Reintentar
        </button>
      </div>
    );
  }

  const firstName = (user.firstName as string) ?? authUser?.firstName ?? '';
  const lastName = (user.lastName as string) ?? authUser?.lastName ?? '';
  const leaderCode = (user.leaderCode as string) ?? null;
  const spiritualStage = (user.spiritualStage as string) ?? null;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const userId = user.id as string;

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
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  }

  const stageLabels: Record<string, string> = { GANADO: 'Ganado', CONSOLIDADO: 'Consolidado', DISCIPULADO: 'Discipulado', ENVIADO: 'Enviado' };
  const stageColors: Record<string, string> = {
    GANADO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    CONSOLIDADO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    DISCIPULADO: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    ENVIADO: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  };

  const primaryGroup = groups.find(g => g.role === 'LEADER') ?? groups.find(g => g.role === 'MEMBER') ?? groups[0];

  return (
    <div className="space-y-6">
      <PageHeader title="Mi Perfil" description="Tu información personal y organizacional" />

      {/* Resumen Card */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-semibold">
            {initials}
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-semibold">{firstName} {lastName}</h2>
              {age !== null && <span className="text-sm text-muted-foreground">{age} años</span>}
              {leaderCode && (
                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-mono">{leaderCode}</span>
              )}
              {spiritualStage && (
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${stageColors[spiritualStage] ?? ''}`}>
                  {stageLabels[spiritualStage] || spiritualStage}
                </span>
              )}
            </div>

            {/* Milestone Badges */}
            {userId && <MilestoneBadges userId={userId} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {leader && (
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Cobertura:</span>{' '}
                  {leader.firstName} {leader.lastName}
                  {leader.leaderCode && <span className="text-xs ml-1">({leader.leaderCode})</span>}
                </div>
              )}
              {primaryGroup && (
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Célula:</span>{' '}
                  <a href={`/groups/${primaryGroup.group.id}`} className="text-primary hover:underline">
                    {primaryGroup.group.name}
                    {primaryGroup.group.code && <span className="text-xs ml-1">({primaryGroup.group.code})</span>}
                  </a>
                </div>
              )}
              {network && (
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Red:</span> {network.name}
                </div>
              )}
              {subordinateCount > 0 && (
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Bajo mi liderazgo:</span> {subordinateCount} personas
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Configuración Organizacional — collapsed by default */}
      {userId && (
        <OrgConfigSection
          userId={userId}
          leaderCode={(user.leaderCode as string) ?? null}
          ministerialRole={(user.ministerialRole as string) ?? null}
          leaderId={(user.leaderId as string) ?? leader?.id ?? null}
          leaderName={leader ? `${leader.firstName} ${leader.lastName}` : null}
          networkId={(user.networkId as string) ?? network?.id ?? null}
          networkName={network?.name ?? null}
          spiritualStage={(user.spiritualStage as string) ?? null}
          hasLaunch={(user.hasLaunch as boolean) ?? false}
          onSaved={fetchProfile}
        />
      )}

      {/* Tabs (includes Hitos tab) */}
      <UserProfileTabs user={user} onUpdate={fetchProfile} />
    </div>
  );
}
