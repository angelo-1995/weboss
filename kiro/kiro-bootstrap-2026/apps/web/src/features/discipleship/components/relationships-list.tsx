'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@community-os/ui';
import type { DiscipleshipRelationship } from '../services/discipleship.service';

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

interface RelationshipsListProps {
  relationships: DiscipleshipRelationship[];
  isLoading: boolean;
}

export function RelationshipsList({ relationships, isLoading }: RelationshipsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border animate-pulse">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-muted rounded w-40" />
              <div className="h-2.5 bg-muted rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!relationships.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No hay relaciones de discipulado activas
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {relationships.map((rel) => (
        <Link
          key={rel.id}
          href={`/discipleship/${rel.id}`}
          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors group"
        >
          {/* Mentor initials */}
          <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {rel.mentor.firstName[0]}{rel.mentor.lastName[0]}
          </div>

          {/* Arrow */}
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

          {/* Disciple initials */}
          <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {rel.disciple.firstName[0]}{rel.disciple.lastName[0]}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {rel.mentor.firstName} {rel.mentor.lastName} → {rel.disciple.firstName} {rel.disciple.lastName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn('text-xs px-1.5 py-0.5 rounded-full', TYPE_COLORS[rel.type])}>
                {TYPE_LABELS[rel.type] || rel.type}
              </span>
              <span className="text-xs text-muted-foreground">
                desde {new Date(rel.startDate).toLocaleDateString('es', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Counts */}
          {rel._count && (
            <div className="shrink-0 text-xs text-muted-foreground text-right">
              <p>{rel._count.milestones} hitos</p>
              <p>{rel._count.checkIns} check-ins</p>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
