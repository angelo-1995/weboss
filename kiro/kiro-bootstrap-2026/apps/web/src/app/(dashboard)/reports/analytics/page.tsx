'use client';

import { PageHeader } from '@/components/layout/page-header';
import { ReportAnalytics } from '@/features/reporting/components/report-analytics';

export default function ReportAnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics de Reportes"
        description="Visualiza tendencias de asistencia, crecimiento y métricas de células"
      />
      <ReportAnalytics />
    </div>
  );
}
