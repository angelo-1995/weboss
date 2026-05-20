'use client';

import { PageHeader } from '@/components/layout/page-header';
import { ActiveSessions } from '@/features/auth/components/active-sessions';

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader
        title="Seguridad"
        description="Gestiona tu contraseña y sesiones activas"
      />

      {/* Change password section placeholder */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">Cambiar contraseña</h2>
        <p className="text-sm text-muted-foreground">
          Para cambiar tu contraseña, usa la opción de recuperación desde la pantalla de login.
        </p>
      </section>

      {/* Active sessions */}
      <section className="space-y-4">
        <ActiveSessions />
      </section>
    </div>
  );
}
