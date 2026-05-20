'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChangePasswordForm } from '@/features/settings/components/change-password-form';
import { NotificationPreferences } from '@/features/settings/components/notification-preferences';
import { ActiveSessions } from '@/features/auth/components/active-sessions';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Configuración"
        description="Gestiona tu cuenta y preferencias"
      />

      <Tabs defaultValue="security">
        <TabsList>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-8 pt-4">
          <section className="space-y-4">
            <h2 className="text-base font-semibold">Cambiar contraseña</h2>
            <ChangePasswordForm />
          </section>

          <section className="space-y-4">
            <ActiveSessions />
          </section>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 pt-4">
          <section className="space-y-4">
            <h2 className="text-base font-semibold">Preferencias de notificación</h2>
            <NotificationPreferences />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
