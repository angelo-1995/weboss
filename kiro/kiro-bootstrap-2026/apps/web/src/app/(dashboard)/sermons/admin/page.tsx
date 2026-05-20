'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { SermonStatsCards } from '@/features/sermons/components/sermon-stats-cards';
import { SermonAdminTable } from '@/features/sermons/components/sermon-admin-table';
import { useSermons } from '@/features/sermons/hooks/use-sermons';

export default function SermonsAdminPage() {
  const router = useRouter();
  const { data, isLoading } = useSermons();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Predicaciones"
        description="Administra las predicaciones de tu red"
      >
        <Button onClick={() => router.push('/sermons/admin/new' as any)}>
          <Plus className="h-4 w-4" />
          Nueva Predicación
        </Button>
      </PageHeader>

      <SermonStatsCards />

      <SermonAdminTable data={data?.items ?? []} isLoading={isLoading} />
    </div>
  );
}
