'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

interface AlertItem {
  groupId: string;
  groupName: string;
  leaderName: string;
  lastReportDate: string | null;
  weeksMissing: number | string;
}

export function ReportAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const data = await api.get<AlertItem[]>('/reports/cell/alerts');
        setAlerts(data);
      } catch {
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  if (loading) return null;
  if (alerts.length === 0) return null;

  return (
    <div className="rounded-lg border border-orange-300 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 p-4">
      <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-3">
        ⚠️ Grupos sin reportar (2+ semanas)
      </h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.groupId}
            className="flex items-center justify-between rounded-md bg-white dark:bg-orange-950/30 px-3 py-2 text-sm border border-orange-200 dark:border-orange-800"
          >
            <div>
              <span className="font-medium">{alert.groupName}</span>
              <span className="text-muted-foreground ml-2">— {alert.leaderName}</span>
            </div>
            <span className="text-xs text-orange-700 dark:text-orange-300 font-medium">
              {typeof alert.weeksMissing === 'number'
                ? `${alert.weeksMissing} semanas`
                : alert.weeksMissing}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
