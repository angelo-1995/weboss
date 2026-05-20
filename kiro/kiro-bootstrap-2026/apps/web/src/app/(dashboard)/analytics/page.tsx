import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { PageSkeleton } from '@/components/feedback/page-skeleton';
import { KPICards } from '@/features/analytics/components/kpi-cards';
import { Leaderboard } from '@/features/analytics/components/leaderboard';

const GrowthChart = dynamic(
  () => import('@/features/reporting/components/growth-chart').then(m => ({ default: m.GrowthChart })),
  { ssr: false, loading: () => <div className="h-64 bg-muted/30 rounded-lg animate-pulse" /> }
);

const GroupsChart = dynamic(
  () => import('@/features/analytics/components/groups-chart').then(m => ({ default: m.GroupsChart })),
  { ssr: false, loading: () => <div className="h-64 bg-muted/30 rounded-lg animate-pulse" /> }
);

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">KPIs, tendencias y métricas organizacionales</p>
      </div>

      <KPICards />

      <Suspense fallback={<div className="h-64 bg-muted/30 rounded-lg animate-pulse" />}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GrowthChart months={12} />
          </div>
          <Leaderboard limit={8} />
        </div>
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-muted/30 rounded-lg animate-pulse" />}>
        <GroupsChart />
      </Suspense>
    </div>
  );
}
