'use client';

import { useOverviewReport } from '../hooks/use-reports';

interface StatCardProps {
  label: string;
  value: number;
  sub?: string;
  loading?: boolean;
}

function StatCard({ label, value, sub, loading }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-1">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
      {loading ? (
        <div className="h-8 w-20 bg-muted rounded animate-pulse" />
      ) : (
        <p className="text-3xl font-semibold tabular-nums">{value.toLocaleString('es')}</p>
      )}
      {sub && !loading && (
        <p className="text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}

export function OverviewCards({ campusId }: { campusId?: string }) {
  const { data, isLoading } = useOverviewReport(campusId);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Usuarios"
        value={data?.users.active ?? 0}
        sub={`${data?.users.total ?? 0} total`}
        loading={isLoading}
      />
      <StatCard
        label="Grupos activos"
        value={data?.groups.active ?? 0}
        sub={`${data?.groups.total ?? 0} total`}
        loading={isLoading}
      />
      <StatCard
        label="Membresías activas"
        value={data?.memberships.active ?? 0}
        sub={`${data?.memberships.total ?? 0} total`}
        loading={isLoading}
      />
      <StatCard
        label="Discipulados"
        value={data?.discipleships.active ?? 0}
        sub="relaciones activas"
        loading={isLoading}
      />
    </div>
  );
}
