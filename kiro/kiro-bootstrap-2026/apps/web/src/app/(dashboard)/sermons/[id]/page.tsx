'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useSermon } from '@/features/sermons/hooks/use-sermons';
import { SermonDetailView } from '@/features/sermons/components/sermon-detail-view';

export default function SermonDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: sermon, isLoading, isError } = useSermon(params.id);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-muted/30 rounded" />
        <div className="aspect-video bg-muted/30 rounded-lg" />
        <div className="space-y-3">
          <div className="h-6 bg-muted/30 rounded w-2/3" />
          <div className="h-4 bg-muted/30 rounded w-1/3" />
          <div className="h-4 bg-muted/30 rounded w-full" />
          <div className="h-4 bg-muted/30 rounded w-full" />
        </div>
      </div>
    );
  }

  if (isError || !sermon) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm text-destructive">No se pudo cargar la predicación</p>
        <button
          onClick={() => router.push('/sermons' as any)}
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a predicaciones
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push('/sermons' as any)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a predicaciones
      </button>

      {/* Sermon detail */}
      <SermonDetailView sermon={sermon} />
    </div>
  );
}
