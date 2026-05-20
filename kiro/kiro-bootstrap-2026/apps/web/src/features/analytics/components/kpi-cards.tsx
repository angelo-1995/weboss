'use client';

import { useKPIs } from '../hooks/use-analytics';
import { cn } from '@community-os/ui';

function Trend({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const up = pct >= 0;
  return (
    <span className={cn('text-xs font-medium', up ? 'text-green-600 dark:text-green-400' : 'text-red-500')}>
      {up ? '↑' : '↓'} {Math.abs(pct)}%
    </span>
  );
}

export function KPICards({ campusId }: { campusId?: string }) {
  const { data, isLoading } = useKPIs(campusId);

  const cards = [
    {
      label: 'Usuarios activos',
      value: data?.users.active,
      sub: `+${data?.users.newThisMonth ?? 0} este mes`,
      trend: data?.users.growthPct ?? null,
    },
    {
      label: 'Grupos activos',
      value: data?.groups.active,
      sub: `+${data?.groups.newThisMonth ?? 0} este mes`,
      trend: null,
    },
    {
      label: 'Membresías activas',
      value: data?.memberships.active,
      sub: `+${data?.memberships.newThisMonth ?? 0} este mes`,
      trend: data?.memberships.growthPct ?? null,
    },
    {
      label: 'Discipulados activos',
      value: data?.discipleships.active,
      sub: `${data?.discipleships.completedMilestones ?? 0} hitos completados`,
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-border bg-card p-5 space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {card.label}
          </p>
          {isLoading ? (
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          ) : (
            <div className="flex items-end gap-2">
              <span className="text-3xl font-semibold tabular-nums">
                {(card.value ?? 0).toLocaleString('es')}
              </span>
              <Trend pct={card.trend} />
            </div>
          )}
          <p className="text-xs text-muted-foreground">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
