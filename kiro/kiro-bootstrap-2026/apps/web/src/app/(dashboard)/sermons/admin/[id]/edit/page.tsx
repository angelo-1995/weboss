'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SermonForm, type SermonFormValues } from '@/features/sermons/components/sermon-form';
import { useSermon } from '@/features/sermons/hooks/use-sermons';
import { useUpdateSermon } from '@/features/sermons/hooks/use-sermon-mutations';

export default function EditSermonPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: sermon, isLoading } = useSermon(params.id);
  const updateMutation = useUpdateSermon();

  const handleSubmit = (data: SermonFormValues) => {
    const payload = {
      title: data.title,
      description: data.description || undefined,
      sermonDate: new Date(data.sermonDate).toISOString(),
      videoUrl: data.videoUrl || undefined,
      externalLink: data.externalLink || undefined,
      publishAt: data.schedulePublish && data.publishAt
        ? new Date(data.publishAt).toISOString()
        : undefined,
    };

    updateMutation.mutate(
      { id: params.id, data: payload },
      {
        onSuccess: () => {
          router.push('/sermons/admin' as any);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  if (!sermon) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Predicación no encontrada</p>
      </div>
    );
  }

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
        <PageHeader title="Editar Predicación" description={sermon.title} />
      </div>

      <SermonForm
        sermon={sermon}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitLabel="Actualizar Predicación"
      />
    </div>
  );
}
