'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useGroupAnalytics } from '../hooks/use-analytics';

const TYPE_LABELS: Record<string, string> = {
  CELL: 'Células',
  MINISTRY: 'Ministerios',
  CAMPUS: 'Campus',
  DEPARTMENT: 'Departamentos',
  TEAM: 'Equipos',
};

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export function GroupsChart() {
  const { data, isLoading } = useGroupAnalytics();

  if (isLoading) return <div className="h-48 bg-muted rounded animate-pulse" />;
  if (!data) return null;

  const chartData = data.byType.map((t) => ({
    name: TYPE_LABELS[t.type] ?? t.type,
    count: t.count,
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-medium">Grupos por tipo</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
