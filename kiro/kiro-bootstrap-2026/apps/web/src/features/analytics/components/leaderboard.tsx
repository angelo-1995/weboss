'use client';

import { useLeaderboard } from '../hooks/use-analytics';

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export function Leaderboard({ limit = 10 }: { limit?: number }) {
  const { data, isLoading } = useLeaderboard(limit);

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-medium">Top líderes por discípulos</h3>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-4 bg-muted rounded animate-pulse" />
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 h-4 bg-muted rounded animate-pulse" />
              <div className="w-8 h-4 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <ol className="space-y-2">
          {(data ?? []).map((entry) => (
            <li key={entry.mentor?.id} className="flex items-center gap-3">
              <span className="w-6 text-center text-sm">
                {MEDAL[entry.rank] ?? <span className="text-muted-foreground">{entry.rank}</span>}
              </span>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border border-border shrink-0">
                {entry.mentor?.firstName?.[0]}{entry.mentor?.lastName?.[0]}
              </div>
              <span className="flex-1 text-sm truncate">
                {entry.mentor?.firstName} {entry.mentor?.lastName}
              </span>
              <span className="text-sm font-semibold tabular-nums text-primary">
                {entry.discipleCount}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
