'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { TrendingUp, TrendingDown, Minus, Users, HandHeart, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';

interface KpiData {
  attendance: { value: number; previousValue: number; change: number };
  visitors: { value: number; previousValue: number; change: number };
  converts: { value: number };
  offering: { value: number; previousValue: number; change: number; currency: string };
  activeGroups: { value: number; total: number };
  compliance: { value: number; reported: number; total: number };
  generatedAt: string;
}

export function PastoralKPIs() {
  const [data, setData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const kpis = await api.get<KpiData>('/dashboard/kpis');
        setData(kpis);
      } catch (err) {
        console.error('Error loading KPIs:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <KpiCard
        icon={<Users className="h-4 w-4" />}
        label="Asistencia"
        value={data.attendance.value}
        change={data.attendance.change}
        suffix=" personas"
      />
      <KpiCard
        icon={<HandHeart className="h-4 w-4" />}
        label="Visitantes"
        value={data.visitors.value}
        change={data.visitors.change}
        isAbsolute
      />
      <KpiCard
        icon={<CheckCircle className="h-4 w-4" />}
        label="Consolidados"
        value={data.converts.value}
      />
      <KpiCard
        icon={<DollarSign className="h-4 w-4" />}
        label="Ofrenda"
        value={data.offering.value}
        change={data.offering.change}
        prefix="B/"
      />
      <KpiCard
        icon={<Users className="h-4 w-4" />}
        label="Equipos Activos"
        value={data.activeGroups.value}
        suffix={`/${data.activeGroups.total}`}
      />
      <KpiCard
        icon={<AlertTriangle className="h-4 w-4" />}
        label="Cumplimiento"
        value={data.compliance.value}
        suffix="%"
        changeLabel={`${data.compliance.reported}/${data.compliance.total}`}
      />
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  change,
  prefix = '',
  suffix = '',
  isAbsolute = false,
  changeLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  change?: number;
  prefix?: string;
  suffix?: string;
  isAbsolute?: boolean;
  changeLabel?: string;
}) {
  const getTrendIcon = () => {
    if (change === undefined || change === 0) return <Minus className="h-3 w-3 text-muted-foreground" />;
    if (change > 0) return <TrendingUp className="h-3 w-3 text-emerald-500" />;
    return <TrendingDown className="h-3 w-3 text-red-500" />;
  };

  const getTrendColor = () => {
    if (change === undefined || change === 0) return 'text-muted-foreground';
    if (change > 0) return 'text-emerald-500';
    return 'text-red-500';
  };

  return (
    <div className="border rounded-xl p-4 bg-card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-primary">{icon}</div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold font-heading tracking-tight">
        {prefix}{value.toLocaleString()}{suffix}
      </p>
      {(change !== undefined || changeLabel) && (
        <div className="flex items-center gap-1 mt-1">
          {change !== undefined && getTrendIcon()}
          <span className={`text-xs ${getTrendColor()}`}>
            {changeLabel ?? (isAbsolute
              ? `${change! > 0 ? '+' : ''}${change}`
              : `${change! > 0 ? '+' : ''}${change}%`)}
          </span>
        </div>
      )}
    </div>
  );
}
