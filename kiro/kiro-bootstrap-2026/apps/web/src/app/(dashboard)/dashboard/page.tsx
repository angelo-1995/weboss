'use client';

import { useAuthStore } from '@/features/auth/stores/auth.store';
import { PastoralKPIs } from '@/features/dashboard/components/pastoral-kpis';
import { PastoralAlerts } from '@/features/dashboard/components/pastoral-alerts';
import { OverviewCards } from '@/features/reporting/components/overview-cards';
import { GrowthChart } from '@/features/reporting/components/growth-chart';
import { AdminDashboard } from '@/features/dashboard/components/admin-dashboard';
import { LeaderDashboard } from '@/features/dashboard/components/leader-dashboard';
import { MemberDashboard } from '@/features/dashboard/components/member-dashboard';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const roles = user?.roles || [];

  const isAdmin = roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');
  const isLeader = roles.includes('LEADER');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? 'Vista general de la organización'
            : isLeader
              ? 'Tu panel de liderazgo'
              : 'Tu progreso personal'}
        </p>
      </div>

      {isAdmin && (
        <>
          <PastoralKPIs />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GrowthChart months={12} />
            </div>
            <div>
              <PastoralAlerts />
            </div>
          </div>
          <AdminDashboard />
        </>
      )}

      {!isAdmin && isLeader && (
        <>
          <PastoralKPIs />
          <PastoralAlerts />
          <LeaderDashboard />
        </>
      )}

      {!isAdmin && !isLeader && <MemberDashboard />}
    </div>
  );
}
