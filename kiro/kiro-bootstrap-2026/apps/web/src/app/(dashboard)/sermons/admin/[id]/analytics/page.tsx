'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, MinusCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSermon, useSermonViews } from '@/features/sermons/hooks/use-sermons';

export default function SermonAnalyticsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: sermon, isLoading: sermonLoading } = useSermon(params.id);
  const { data: analytics, isLoading: analyticsLoading } = useSermonViews(params.id);

  const isLoading = sermonLoading || analyticsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!sermon || !analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Predicación no encontrada</p>
      </div>
    );
  }

  const viewedPercentage =
    analytics.totalMembers > 0
      ? Math.round((analytics.totalViews / analytics.totalMembers) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/sermons/admin' as any)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Analytics de Predicación"
          description={sermon.title}
        />
      </div>

      {/* Progress Bar */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Progreso de visualización</span>
          <span className="text-sm text-muted-foreground">
            {analytics.totalViews} / {analytics.totalMembers} miembros ({viewedPercentage}%)
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all"
            style={{ width: `${viewedPercentage}%` }}
          />
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-primary" />
            Vieron: {analytics.totalViews}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
            No han visto: {analytics.totalMembers - analytics.totalViews}
          </span>
        </div>
      </div>

      {/* Member Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Viewed Members */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Miembros que vieron ({analytics.viewedMembers.length})
          </h3>
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {analytics.viewedMembers.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-2 text-sm py-1 border-b border-border/50 last:border-0"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <span className="flex-1">
                  {member.firstName} {member.lastName}
                </span>
                <span className="text-xs text-muted-foreground">{member.email}</span>
              </li>
            ))}
            {analytics.viewedMembers.length === 0 && (
              <li className="text-sm text-muted-foreground py-2">Ningún miembro ha visto esta predicación</li>
            )}
          </ul>
        </div>

        {/* Not Viewed Members */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <MinusCircle className="h-4 w-4 text-muted-foreground" />
            Miembros que no han visto ({analytics.notViewedMembers.length})
          </h3>
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {analytics.notViewedMembers.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-2 text-sm py-1 border-b border-border/50 last:border-0"
              >
                <MinusCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="flex-1">
                  {member.firstName} {member.lastName}
                </span>
                <span className="text-xs text-muted-foreground">{member.email}</span>
              </li>
            ))}
            {analytics.notViewedMembers.length === 0 && (
              <li className="text-sm text-muted-foreground py-2">Todos los miembros han visto esta predicación</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
