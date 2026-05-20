'use client';

import { BookOpen, Eye, Clock, TrendingUp } from 'lucide-react';
import { useSermonAdminStats } from '../hooks/use-sermons';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function SermonStatsCards() {
  const { data, isLoading } = useSermonAdminStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Publicadas"
        value={data?.totalPublished ?? 0}
        icon={<BookOpen className="h-4 w-4" />}
      />
      <StatCard
        label="Total Vistas"
        value={data?.totalViews ?? 0}
        icon={<Eye className="h-4 w-4" />}
      />
      <StatCard
        label="Programadas"
        value={data?.pendingScheduled ?? 0}
        icon={<Clock className="h-4 w-4" />}
      />
      <StatCard
        label="Promedio Vistas"
        value={data?.avgViewsPerSermon ?? 0}
        icon={<TrendingUp className="h-4 w-4" />}
      />
    </div>
  );
}
