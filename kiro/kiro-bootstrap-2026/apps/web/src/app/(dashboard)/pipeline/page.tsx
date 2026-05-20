import { PageHeader } from '@/components/layout/page-header';
import { PipelineView } from '@/features/users/components/pipeline-view';

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline Espiritual"
        description="Ciclo de vida espiritual: Ganado → Consolidado → Discipulado → Enviado"
      />
      <PipelineView />
    </div>
  );
}
