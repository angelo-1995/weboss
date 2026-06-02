'use client';

import { Edit, Send, Lock } from 'lucide-react';
import type { WizardFormData, ReportStatus } from './ReportWizard';

interface Props {
  data: WizardFormData;
  reportStatus: ReportStatus;
  submitting: boolean;
  onSubmit: () => void;
  onPrev: () => void;
  onEditStep: (step: number) => void;
}

export function StepResumen({ data, reportStatus, submitting, onSubmit, onPrev, onEditStep }: Props) {
  const totalAttendance = data.menCount + data.womenCount + data.youthMaleCount + data.youthFemaleCount + data.childrenCount;
  const isClosed = reportStatus === 'closed';

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-heading">Resumen</h3>
      <p className="text-sm text-muted-foreground">Revisa tu reporte antes de enviar</p>

      {/* Identificación */}
      <SummarySection title="Identificación" onEdit={() => onEditStep(0)}>
        <SummaryRow label="Equipo" value={data.cellCode || 'No seleccionado'} />
        <SummaryRow label="Fecha" value={data.meetingDate || '—'} />
        <SummaryRow label="Líder" value={data.leaderName || '—'} />
        <SummaryRow label="Co-líder" value={data.coLeaderName || '—'} />
        <SummaryRow label="Cobertura" value={data.coverageName || '—'} />
        <SummaryRow label="Horario" value={`${data.startTime || '—'} - ${data.endTime || '—'}`} />
      </SummarySection>

      {/* Asistencia */}
      <SummarySection title="Asistencia" onEdit={() => onEditStep(1)}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <MiniStat label="Hombres" value={data.menCount} />
          <MiniStat label="Mujeres" value={data.womenCount} />
          <MiniStat label="Jóv. H" value={data.youthMaleCount} />
          <MiniStat label="Jóv. M" value={data.youthFemaleCount} />
          <MiniStat label="Niños" value={data.childrenCount} />
          <MiniStat label="Visitantes" value={data.visitorsCount} highlight />
          <MiniStat label="Convertidos" value={data.convertsCount} highlight />
          <MiniStat label="Reconciliados" value={data.reconciledCount} />
        </div>
        <div className="mt-3 p-3 bg-primary/5 rounded-lg text-center">
          <span className="text-sm text-muted-foreground">Total: </span>
          <span className="text-xl font-heading text-primary">{totalAttendance}</span>
        </div>
      </SummarySection>

      {/* Reunión */}
      <SummarySection title="Reunión" onEdit={() => onEditStep(2)}>
        <SummaryRow label="Tema" value={data.messageTopic || 'Sin tema'} />
        <SummaryRow label="Ofrenda" value={data.offeringAmount ? `B/${data.offeringAmount.toFixed(2)}` : 'No registrada'} />
        <SummaryRow label="Ubicación" value={[data.neighborhood, data.street, data.houseNumber].filter(Boolean).join(', ') || '—'} />
        <SummaryRow label="Supervisada" value={data.wasSupervised ? 'Sí' : 'No'} />
        {data.observations && <SummaryRow label="Observaciones" value={data.observations} />}
      </SummarySection>

      {/* Submit */}
      <div className="flex justify-between pt-4 border-t">
        <button onClick={onPrev} className="px-4 py-2 text-sm border rounded-lg hover:bg-muted/50 transition-colors">
          ← Anterior
        </button>

        {isClosed ? (
          <button disabled className="px-6 py-2.5 bg-muted text-muted-foreground rounded-lg text-sm font-medium cursor-not-allowed flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Período Cerrado
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {submitting ? 'Enviando...' : 'Enviar Reporte'}
          </button>
        )}
      </div>
    </div>
  );
}

function SummarySection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{title}</h4>
        <button onClick={onEdit} className="text-xs text-primary hover:underline flex items-center gap-1">
          <Edit className="h-3 w-3" />
          Editar
        </button>
      </div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

function MiniStat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`text-center p-2 rounded-lg ${highlight ? 'bg-[#FFB400]/10' : 'bg-muted/50'}`}>
      <p className={`text-lg font-bold ${highlight ? 'text-[#FFB400]' : ''}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
