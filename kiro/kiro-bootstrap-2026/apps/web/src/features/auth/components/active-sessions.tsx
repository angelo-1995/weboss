'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';

interface SessionItem {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  current: boolean;
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return 'Dispositivo desconocido';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Mobile')) return 'Móvil';
  return 'Navegador';
}

export function ActiveSessions() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const data = await api.get<SessionItem[]>('/auth/sessions');
      setSessions(data);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const revokeSession = async (sessionId: string) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      // ignore
    }
  };

  const revokeAllOthers = async () => {
    const others = sessions.filter((s) => !s.current);
    for (const s of others) {
      await api.delete(`/auth/sessions/${s.id}`);
    }
    setSessions((prev) => prev.filter((s) => s.current));
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando sesiones...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Sesiones activas</h3>
        {sessions.filter((s) => !s.current).length > 0 && (
          <Button variant="outline" size="sm" onClick={revokeAllOthers} type="button">
            Cerrar todas las demás
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {parseUserAgent(session.userAgent)}
                </span>
                {session.current && (
                  <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
                    Sesión actual
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {session.ipAddress && <span>IP: {session.ipAddress}</span>}
                <span>{new Date(session.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
            {!session.current && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => revokeSession(session.id)}
                className="text-destructive hover:text-destructive"
                type="button"
              >
                Cerrar
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
