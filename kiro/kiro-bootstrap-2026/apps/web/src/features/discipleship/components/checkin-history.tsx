'use client';

import { Star, Calendar } from 'lucide-react';
import { cn } from '@community-os/ui';
import type { CheckIn } from '../services/discipleship.service';

interface CheckInHistoryProps {
  checkIns: CheckIn[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-3.5 w-3.5',
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground/20',
          )}
        />
      ))}
    </div>
  );
}

export function CheckInHistory({ checkIns }: CheckInHistoryProps) {
  if (!checkIns.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No hay check-ins registrados
      </p>
    );
  }

  // Sort most recent first
  const sorted = [...checkIns].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {sorted.map((checkIn) => (
        <div
          key={checkIn.id}
          className="rounded-lg border border-border p-3 space-y-2"
        >
          {/* Header: date + rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(checkIn.date).toLocaleDateString('es', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
            <StarRating rating={checkIn.rating} />
          </div>

          {/* Notes */}
          {checkIn.notes && (
            <p className="text-sm text-foreground line-clamp-3">
              {checkIn.notes}
            </p>
          )}

          {/* Topics */}
          {checkIn.topics && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Temas:</span> {checkIn.topics}
            </p>
          )}

          {/* Attendees */}
          {checkIn.attendees && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Asistentes:</span> {checkIn.attendees}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
