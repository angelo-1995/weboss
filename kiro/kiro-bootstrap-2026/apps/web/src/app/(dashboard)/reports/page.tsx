'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { ReportWizard } from '@/features/reporting/components/wizard/ReportWizard';
import { ExportButton } from '@/features/reporting/components/export-button';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporte de Célula"
        description="Registra el informe semanal de tu equipo ministerial"
      />
      <div className="flex flex-wrap gap-3">
        <Link
          href={'/reports/analytics' as any}
          className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          📊 Analytics de Reportes
        </Link>
        <ExportButton />
      </div>
      <ReportWizard />
    </div>
  );
}
