'use client';

import { Check, Circle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@community-os/ui';
import { Button } from '@/components/ui/button';
import { useCompleteMilestone } from '../hooks/use-discipleship';
import type { Milestone } from '../services/discipleship.service';

interface MilestonesTimelineProps {
  milestones: Milestone[];
  relationshipId: string;
}

export function MilestonesTimeline({ milestones, relationshipId }: MilestonesTimelineProps) {
  const completeMutation = useCompleteMilestone(relationshipId);

  const handleComplete = async (milestoneId: string) => {
    try {
      await completeMutation.mutateAsync(milestoneId);
      toast.success('Hito completado');
    } catch {
      toast.error('Error al completar el hito');
    }
  };

  if (!milestones.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No hay hitos registrados
      </p>
    );
  }

  const sorted = [...milestones].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-1">
      {sorted.map((milestone, index) => {
        const isCompleted = milestone.status === 'COMPLETED' || !!milestone.completedAt;
        const isLast = index === sorted.length - 1;

        return (
          <div key={milestone.id} className="flex gap-3">
            {/* Timeline line + icon */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors',
                  isCompleted
                    ? 'bg-green-100 border-green-500 text-green-600 dark:bg-green-900 dark:border-green-400 dark:text-green-300'
                    : 'bg-muted border-border text-muted-foreground',
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>
              {!isLast && (
                <div className={cn(
                  'w-px flex-1 min-h-[24px]',
                  isCompleted ? 'bg-green-300 dark:bg-green-700' : 'bg-border',
                )} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={cn(
                    'text-sm font-medium',
                    isCompleted && 'line-through text-muted-foreground',
                  )}>
                    {milestone.title}
                  </p>
                  {milestone.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {milestone.description}
                    </p>
                  )}
                  {isCompleted && milestone.completedAt && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                      Completado {new Date(milestone.completedAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>

                {!isCompleted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs h-7"
                    onClick={() => handleComplete(milestone.id)}
                    disabled={completeMutation.isPending}
                  >
                    {completeMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      'Completar'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
