'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useGrowthReport } from '../hooks/use-reports';

export function GrowthChart({ months = 12 }: { months?: number }) {
  const { data, isLoading } = useGrowthReport(months);

  if (isLoading) {
    return <div className="h-64 bg-muted rounded animate-pulse" />;
  }

  if (!data) return null;

  // Merge all series into a single dataset by month
  const allMonths = Array.from(
    new Set([
      ...data.users.map((d) => d.month),
      ...data.memberships.map((d) => d.month),
      ...data.groups.map((d) => d.month),
    ]),
  ).sort();

  const chartData = allMonths.map((month) => ({
    month,
    usuarios: data.users.find((d) => d.month === month)?.count ?? 0,
    membresías: data.memberships.find((d) => d.month === month)?.count ?? 0,
    grupos: data.groups.find((d) => d.month === month)?.count ?? 0,
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-medium">Crecimiento mensual</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: string) => v.slice(5)} // show MM only
            className="text-muted-foreground"
          />
          <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" dataKey="usuarios" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="membresías" stroke="#10b981" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="grupos" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
