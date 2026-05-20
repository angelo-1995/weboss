'use client';

import { useAuthStore } from '@/features/auth/stores/auth.store';
import { OverviewCards } from '@/features/reporting/components/overview-cards';
import { GrowthChart } from '@/features/reporting/components/growth-chart';
import { ReportAlerts } from '@/features/reporting/components/report-alerts';
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
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
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
          <ReportAlerts />
          <OverviewCards />
          <GrowthChart months={12} />
          <AdminDashboard />
        </>
      )}

      {!isAdmin && isLeader && <LeaderDashboard />}

      {!isAdmin && !isLeader && <MemberDashboard />}
    </div>
  );
}
