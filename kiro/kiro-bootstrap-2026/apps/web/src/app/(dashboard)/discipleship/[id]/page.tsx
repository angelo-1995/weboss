'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { cn } from '@community-os/ui';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { useRelationship } from '@/features/discipleship/hooks/use-discipleship';
import { MilestoneForm } from '@/features/discipleship/components/milestone-form';
import { MilestonesTimeline } from '@/features/discipleship/components/milestones-timeline';
import { CheckInForm } from '@/features/discipleship/components/checkin-form';
import { CheckInHistory } from '@/features/discipleship/components/checkin-history';

const TYPE_COLORS: Record<string, string> = {
  MENTOR_MENTEE: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  LEADER_MEMBER: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  ACCOUNTABILITY: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  PASTORAL: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

const TYPE_LABELS: Record<string, string> = {
  MENTOR_MENTEE: 'Mentor-Discípulo',
  LEADER_MEMBER: 'Líder-Miembro',
  ACCOUNTABILITY: 'Accountability',
  PASTORAL: 'Pastoral',
};

export default function DiscipleshipDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: relationship, isLoading, isError } = useRelationship(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !relationship) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-destructive">Error al cargar la relación de discipulado</p>
        <Link href="/discipleship" className="text-sm text-primary underline mt-2 inline-block">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div>
        <Link
          href="/discipleship"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Discipulado
        </Link>

        <PageHeader
          title={`${relationship.mentor.firstName} ${relationship.mentor.lastName} → ${relationship.disciple.firstName} ${relationship.disciple.lastName}`}
        >
          <Link href={`/discipleship/${id}/report`}>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-1" />
              Nuevo Reporte
            </Button>
          </Link>
        </PageHeader>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', TYPE_COLORS[relationship.type])}>
            {TYPE_LABELS[relationship.type] || relationship.type}
          </span>
          <span className="text-xs text-muted-foreground">
            Estado: <span className="font-medium text-foreground">{relationship.status}</span>
          </span>
          <span className="text-xs text-muted-foreground">
            Inicio: {new Date(relationship.startDate).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Milestones */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm font-semibold mb-4">Hitos del Discipulado</h2>
            <MilestonesTimeline
              milestones={relationship.milestones || []}
              relationshipId={id}
            />
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Agregar Hito</h3>
            <MilestoneForm relationshipId={id} />
          </div>
        </div>

        {/* Right: Check-ins */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm font-semibold mb-4">Historial de Check-ins</h2>
            <CheckInHistory checkIns={relationship.checkIns || []} />
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Registrar Check-in</h3>
            <CheckInForm relationshipId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
