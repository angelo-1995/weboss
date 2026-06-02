'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useGroups } from '@/features/groups/hooks/use-groups';
import { WizardProgress } from './WizardProgress';
import { StepIdentificacion } from './StepIdentificacion';
import { StepAsistencia } from './StepAsistencia';
import { StepReunion } from './StepReunion';
import { StepResumen } from './StepResumen';
import { ReportStatusBanner } from './ReportStatusBanner';
import { Lock, Clock, CheckCircle2, FileText } from 'lucide-react';

export type ReportStatus = 'draft' | 'open' | 'late' | 'closed' | 'submitted';

export interface WizardFormData {
  groupId: string;
  cellCode: string;
  meetingDate: string;
  coverageName: string;
  leaderName: string;
  coLeaderName: string;
  contactPhone: string;
  menCount: number;
  womenCount: number;
  youthMaleCount: number;
  youthFemaleCount: number;
  childrenCount: number;
  visitorsCount: number;
  convertsCount: number;
  reconciledCount: number;
  messageTopic: string;
  startTime: string;
  endTime: string;
  offeringAmount: number | undefined;
  district: string;
  neighborhood: string;
  sector: string;
  street: string;
  houseNumber: string;
  wasSupervised: boolean;
  observations: string;
}

const INITIAL_DATA: WizardFormData = {
  groupId: '',
  cellCode: '',
  meetingDate: '',
  coverageName: '',
  leaderName: '',
  coLeaderName: '',
  contactPhone: '',
  menCount: 0,
  womenCount: 0,
  youthMaleCount: 0,
  youthFemaleCount: 0,
  childrenCount: 0,
  visitorsCount: 0,
  convertsCount: 0,
  reconciledCount: 0,
  messageTopic: '',
  startTime: '',
  endTime: '',
  offeringAmount: undefined,
  district: '',
  neighborhood: '',
  sector: '',
  street: '',
  houseNumber: '',
  wasSupervised: false,
  observations: '',
};

const STEPS = [
  { key: 'identificacion', label: 'Identificación', shortLabel: 'ID' },
  { key: 'asistencia', label: 'Asistencia', shortLabel: 'Asist.' },
  { key: 'reunion', label: 'Reunión', shortLabel: 'Reun.' },
  { key: 'resumen', label: 'Resumen', shortLabel: 'Envío' },
];

export function ReportWizard() {
  const { accessToken } = useAuthStore();
  const { data: groupsData } = useGroups({ pageSize: 100 });
  const groups = groupsData?.data ?? [];

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>(INITIAL_DATA);
  const [reportStatus, setReportStatus] = useState<ReportStatus>('open');
  const [periodInfo, setPeriodInfo] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // ── Period Locking Check ──────────────────────────────────
  useEffect(() => {
    if (!formData.meetingDate) {
      setReportStatus('open');
      setPeriodInfo(null);
      return;
    }

    const checkPeriod = async () => {
      try {
        const info = await api.get<any>('/dashboard/report-period', { meetingDate: formData.meetingDate });
        setPeriodInfo(info);
        if (!info.canSubmit) {
          setReportStatus('closed');
        } else if (info.status === 'LATE') {
          setReportStatus('late');
        } else {
          setReportStatus('open');
        }
      } catch {
        setReportStatus('open'); // fallback: allow submission
      }
    };
    checkPeriod();
  }, [formData.meetingDate]);

  // ── Autosave (localStorage) ───────────────────────────────
  useEffect(() => {
    const key = `report-draft:${formData.groupId || 'new'}`;
    const timer = setInterval(() => {
      if (formData.groupId || formData.cellCode) {
        localStorage.setItem(key, JSON.stringify({ step, data: formData, savedAt: new Date().toISOString() }));
        setLastSaved(new Date());
      }
    }, 30000); // every 30s

    return () => clearInterval(timer);
  }, [formData, step]);

  // ── Restore draft on mount ────────────────────────────────
  useEffect(() => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('report-draft:'));
    if (keys.length > 0) {
      const draft = JSON.parse(localStorage.getItem(keys[0]) || '{}');
      if (draft.data && draft.savedAt) {
        const age = Date.now() - new Date(draft.savedAt).getTime();
        if (age < 7 * 24 * 60 * 60 * 1000) { // < 7 days
          setFormData(draft.data);
          setStep(draft.step || 0);
          setLastSaved(new Date(draft.savedAt));
          toast.info('Borrador restaurado');
        } else {
          localStorage.removeItem(keys[0]);
          toast.info('Borrador expirado (más de 7 días)');
        }
      }
    }
  }, []);

  // ── Update form data ──────────────────────────────────────
  const updateData = useCallback((partial: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  }, []);

  // ── Navigation ────────────────────────────────────────────
  const nextStep = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prevStep = () => setStep((s) => Math.max(0, s - 1));
  const goToStep = (s: number) => setStep(s);

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (reportStatus === 'closed') {
      toast.error('El período de reporte está cerrado');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/reports/cell', {
        ...formData,
        offeringAmount: formData.offeringAmount || null,
      });

      // Clear draft
      const key = `report-draft:${formData.groupId || 'new'}`;
      localStorage.removeItem(key);

      setSubmitted(true);
      toast.success('¡Reporte enviado exitosamente!');
    } catch (err: any) {
      if (err.status === 409) {
        toast.error('Ya existe un reporte para esta semana');
      } else if (err.status === 403) {
        toast.error('No tienes permiso para enviar este reporte');
      } else {
        toast.error(err.message || 'Error al enviar el reporte');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success State ─────────────────────────────────────────
  if (submitted) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-heading">¡Reporte Enviado!</h2>
        <p className="text-sm text-muted-foreground">Tu informe de célula ha sido registrado exitosamente.</p>
        <div className="flex gap-3 justify-center pt-4">
          <button
            onClick={() => { setSubmitted(false); setFormData(INITIAL_DATA); setStep(0); }}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-muted/50 transition-colors"
          >
            Nuevo Reporte
          </button>
          <a
            href="/reports"
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Ver Historial
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Status Banner */}
      <ReportStatusBanner status={reportStatus} periodInfo={periodInfo} />

      {/* Progress */}
      <WizardProgress steps={STEPS} currentStep={step} onStepClick={goToStep} />

      {/* Autosave indicator */}
      {lastSaved && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Borrador guardado: {lastSaved.toLocaleTimeString('es-PA', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}

      {/* Step Content */}
      <div className="border rounded-xl p-6 bg-card">
        {step === 0 && (
          <StepIdentificacion
            data={formData}
            groups={groups}
            onChange={updateData}
            onNext={nextStep}
          />
        )}
        {step === 1 && (
          <StepAsistencia
            data={formData}
            onChange={updateData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
        {step === 2 && (
          <StepReunion
            data={formData}
            onChange={updateData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
        {step === 3 && (
          <StepResumen
            data={formData}
            reportStatus={reportStatus}
            submitting={submitting}
            onSubmit={handleSubmit}
            onPrev={prevStep}
            onEditStep={goToStep}
          />
        )}
      </div>
    </div>
  );
}
