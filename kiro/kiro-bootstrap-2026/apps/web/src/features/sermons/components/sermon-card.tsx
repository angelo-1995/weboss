'use client';

import Link from 'next/link';
import { BookOpen, Eye } from 'lucide-react';
import { cn } from '@community-os/ui';
import type { Sermon } from '../types/sermon.types';

interface SermonCardProps {
  sermon: Sermon;
  isUnread?: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-PA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

export function SermonCard({ sermon, isUnread = false }: SermonCardProps) {
  return (
    <Link
      href={`/sermons/${sermon.id}` as any}
      className="group block rounded-lg border border-border/50 bg-card overflow-hidden hover:shadow-md hover:border-border transition-all duration-200"
    >
      {/* Cover image or placeholder */}
      <div className="relative aspect-video bg-muted/30 overflow-hidden">
        {sermon.coverImageUrl ? (
          <img
            src={sermon.coverImageUrl}
            alt={sermon.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <BookOpen className="h-10 w-10 text-primary/30" />
          </div>
        )}

        {/* Unread badge */}
        {isUnread && (
          <span className="absolute top-2 right-2 flex h-5 items-center gap-1 rounded-full bg-primary px-2 text-[10px] font-semibold text-primary-foreground">
            <Eye className="h-3 w-3" />
            Nuevo
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              'text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors',
              isUnread && 'text-foreground',
              !isUnread && 'text-foreground/80',
            )}
          >
            {sermon.title}
          </h3>
        </div>

        <p className="text-xs text-muted-foreground">{formatDate(sermon.sermonDate)}</p>

        {sermon.description && (
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            {truncate(sermon.description, 150)}
          </p>
        )}
      </div>
    </Link>
  );
}
