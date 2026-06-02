'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { AlertTriangle, TrendingDown, UserX, CheckCircle2 } from 'lucide-react';

interface Alert {
  id: string;
  type: string;
  message: string;
  metadata: any;
  acknowledged: boolean;
  createdAt: string;
  targetGroup?: { id: string; name: string; code: string };
}

const alertIcons: Record<string, React.ReactNode> = {
  MISSING_REPORT: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  DECLINING_ATTENDANCE: <TrendingDown className="h-4 w-4 text-red-500" />,
  ZERO_VISITORS: <UserX className="h-4 w-4 text-orange-500" />,
};

const alertColors: Record<string, string> = {
  MISSING_REPORT: 'border-l-amber-500',
  DECLINING_ATTENDANCE: 'border-l-red-500',
  ZERO_VISITORS: 'border-l-orange-500',
};

export function PastoralAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<Alert[]>('/dashboard/alerts');
        setAlerts(data);
      } catch (err) {
        console.error('Error loading alerts:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await api.patch(`/dashboard/alerts/${alertId}/acknowledge`);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="border rounded-xl p-6 text-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
        <p className="text-sm font-medium">No hay alertas activas</p>
        <p className="text-xs text-muted-foreground mt-1">Todos los equipos están al día 🎉</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Alertas Pastorales ({alerts.length})
        </h3>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
        {alerts.slice(0, 10).map((alert) => (
          <div
            key={alert.id}
            className={`border border-l-4 ${alertColors[alert.type] ?? 'border-l-gray-500'} rounded-lg p-3 flex items-start justify-between gap-3 bg-card`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{alertIcons[alert.type] ?? <AlertTriangle className="h-4 w-4" />}</div>
              <div>
                <p className="text-sm font-medium">{alert.message}</p>
                {alert.targetGroup && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {alert.targetGroup.code} · {alert.targetGroup.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(alert.createdAt).toLocaleDateString('es-PA')}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleAcknowledge(alert.id)}
              className="text-xs text-primary hover:underline whitespace-nowrap"
            >
              Atender
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
