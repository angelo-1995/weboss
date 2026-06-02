'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { ArrowDown, Sparkles, Clock } from 'lucide-react';

interface TimelineEntry {
  id: string;
  changedAt: string;
  notes: string | null;
  fromStage: { id: string; name: string; code: string; color: string } | null;
  toStage: { id: string; name: string; code: string; color: string };
}

export function PersonTimeline({ personId }: { personId: string }) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<TimelineEntry[]>(`/persons/${personId}/timeline`);
        setEntries(data);
      } catch (err) {
        console.error('Error loading timeline:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [personId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 h-16 bg-muted animate-pulse rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="border rounded-xl p-8 text-center">
        <Sparkles className="h-10 w-10 text-[#FFB400] mx-auto mb-3" />
        <p className="text-sm font-medium">Sin historial de pipeline</p>
        <p className="text-xs text-muted-foreground mt-1">
          El timeline se actualizará cuando esta persona avance en su camino espiritual
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Summary stats */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-muted/30 rounded-xl">
        <div className="text-center">
          <p className="text-2xl font-heading">{entries.length}</p>
          <p className="text-xs text-muted-foreground">Avances</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <p className="text-2xl font-heading">
            {calculateDaysSinceFirst(entries)}
          </p>
          <p className="text-xs text-muted-foreground">Días en camino</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: entries[0]?.toStage.color }}>
            {entries[0]?.toStage.name}
          </p>
          <p className="text-xs text-muted-foreground">Stage actual</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

        {entries.map((entry, index) => {
          const isFirst = index === 0; // Most recent
          const isLast = index === entries.length - 1; // Oldest (initial)
          const date = new Date(entry.changedAt);

          return (
            <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Dot */}
              <div className="relative z-10 shrink-0">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                    isFirst ? 'border-primary bg-primary/10' : 'border-border bg-card'
                  }`}
                  style={isFirst ? { borderColor: entry.toStage.color, backgroundColor: `${entry.toStage.color}15` } : {}}
                >
                  {isLast ? (
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ArrowDown className="h-4 w-4" style={{ color: entry.toStage.color }} />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className={`flex-1 border rounded-xl p-4 ${isFirst ? 'bg-card shadow-sm' : 'bg-card/50'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    {/* Stage transition */}
                    <div className="flex items-center gap-2">
                      {entry.fromStage && (
                        <>
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${entry.fromStage.color}15`, color: entry.fromStage.color }}
                          >
                            {entry.fromStage.name}
                          </span>
                          <span className="text-muted-foreground text-xs">→</span>
                        </>
                      )}
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${entry.toStage.color}20`, color: entry.toStage.color }}
                      >
                        {entry.toStage.name}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm font-medium mt-1.5">
                      {entry.fromStage
                        ? `Avanzó a ${entry.toStage.name}`
                        : `Ingresó como ${entry.toStage.name}`}
                    </p>

                    {/* Notes */}
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        "{entry.notes}"
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xs font-medium">
                      {date.toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isFirst ? 'Actual' : `Hace ${daysSince(date)} días`}
                    </p>
                  </div>
                </div>

                {/* Time in stage (if not the most recent) */}
                {!isFirst && index > 0 && (
                  <div className="mt-2 pt-2 border-t flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {calculateDaysInStage(entries, index)} días en esta etapa
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateDaysSinceFirst(entries: TimelineEntry[]): number {
  if (entries.length === 0) return 0;
  const oldest = entries[entries.length - 1];
  return daysSince(new Date(oldest.changedAt));
}

function calculateDaysInStage(entries: TimelineEntry[], index: number): number {
  const currentEntry = new Date(entries[index].changedAt);
  const nextEntry = index > 0 ? new Date(entries[index - 1].changedAt) : new Date();
  return Math.floor((nextEntry.getTime() - currentEntry.getTime()) / (1000 * 60 * 60 * 24));
}
