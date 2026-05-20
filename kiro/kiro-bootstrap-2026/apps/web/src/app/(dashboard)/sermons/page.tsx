'use client';

import { useEffect, useRef, useCallback } from 'react';
import { BookOpen } from 'lucide-react';
import { useInfiniteSermons } from '@/features/sermons/hooks/use-infinite-sermons';
import { useSermonFiltersStore } from '@/features/sermons/stores/sermon-filters.store';
import { SermonCard } from '@/features/sermons/components/sermon-card';
import { SermonFilterBar } from '@/features/sermons/components/sermon-filter-bar';

export default function SermonsPage() {
  const { search, dateFrom, dateTo } = useSermonFiltersStore();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteSermons({
      search: search || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });

  // Infinite scroll with IntersectionObserver
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { rootMargin: '200px' },
      );
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const sermons = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Predicaciones</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explora las predicaciones de tu red
        </p>
      </div>

      {/* Filter bar */}
      <SermonFilterBar />

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border/50 bg-card overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-muted/30" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted/30 rounded w-3/4" />
                <div className="h-3 bg-muted/30 rounded w-1/3" />
                <div className="h-3 bg-muted/30 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="text-center py-12">
          <p className="text-sm text-destructive">Error al cargar las predicaciones</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && sermons.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">No hay predicaciones disponibles</p>
        </div>
      )}

      {/* Sermon grid */}
      {sermons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sermons.map((sermon) => (
            <SermonCard
              key={sermon.id}
              sermon={sermon}
              isUnread={sermon._count.views === 0}
            />
          ))}
        </div>
      )}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-1" />

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
