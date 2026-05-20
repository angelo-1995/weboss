import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageSkeleton } from '@/components/feedback/page-skeleton';

const ReportAnalytics = dynamic(
  () => import('@/features/reporting/components/report-analytics').then(m => ({ default: m.ReportAnalytics })),
  { ssr: false, loading: () => <PageSkeleton type="detail" /> }
);

export default function ReportAnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics de Reportes"
        description="Visualiza tendencias de asistencia, crecimiento y métricas de células"
      />
      <Suspense fallback={<PageSkeleton type="detail" />}>
        <ReportAnalytics />
      </Suspense>
    </div>
  );
}
