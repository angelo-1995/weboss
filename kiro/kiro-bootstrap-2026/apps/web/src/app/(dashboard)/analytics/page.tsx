import { KPICards } from '@/features/analytics/components/kpi-cards';
import { Leaderboard } from '@/features/analytics/components/leaderboard';
import { GroupsChart } from '@/features/analytics/components/groups-chart';
import { GrowthChart } from '@/features/reporting/components/growth-chart';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">KPIs, tendencias y métricas organizacionales</p>
      </div>

      <KPICards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GrowthChart months={12} />
        </div>
        <Leaderboard limit={8} />
      </div>

      <GroupsChart />
    </div>
  );
}
