'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { SermonForm, type SermonFormValues } from '@/features/sermons/components/sermon-form';
import { useCreateSermon } from '@/features/sermons/hooks/use-sermon-mutations';

export default function NewSermonPage() {
  const router = useRouter();
  const createMutation = useCreateSermon();

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

    createMutation.mutate(payload, {
      onSuccess: () => {
        router.push('/sermons/admin' as any);
      },
    });
  };

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
        <PageHeader title="Nueva Predicación" description="Crea una nueva predicación para tu red" />
      </div>

      <SermonForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitLabel="Crear Predicación"
      />
    </div>
  );
}
