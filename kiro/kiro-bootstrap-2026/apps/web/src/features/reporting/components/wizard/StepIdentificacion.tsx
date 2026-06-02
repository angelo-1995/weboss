'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import type { WizardFormData } from './ReportWizard';

interface Props {
  data: WizardFormData;
  groups: Array<{ id: string; name: string; code?: string }>;
  onChange: (partial: Partial<WizardFormData>) => void;
  onNext: () => void;
}

export function StepIdentificacion({ data, groups, onChange, onNext }: Props) {
  const [lookupLoading, setLookupLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-lookup when group changes
  useEffect(() => {
    if (!data.groupId) return;
    const timer = setTimeout(async () => {
      setLookupLoading(true);
      try {
        const result = await api.get<any>('/reports/cell/lookup-by-group', { groupId: data.groupId });
        if (result.code) onChange({ cellCode: result.code });
        if (result.leader) onChange({ leaderName: result.leader });
        if (result.coLeader) onChange({ coLeaderName: result.coLeader });
        if (result.coverage) onChange({ coverageName: result.coverage });
        if (result.phone) onChange({ contactPhone: result.phone });
        if (result.location) {
          onChange({
            district: result.location.corregimiento || result.location.district || '',
            neighborhood: result.location.neighborhood || '',
            street: result.location.street || '',
            houseNumber: result.location.houseNumber || '',
          });
        }
      } catch { /* silently fail */ }
      finally { setLookupLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [data.groupId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.groupId) e.groupId = 'Selecciona un equipo';
    if (!data.cellCode) e.cellCode = 'Ingresa el código';
    if (!data.meetingDate) e.meetingDate = 'Selecciona la fecha';
    if (!data.leaderName) e.leaderName = 'Ingresa el nombre del líder';
    if (!data.startTime) e.startTime = 'Ingresa hora de inicio';
    if (!data.endTime) e.endTime = 'Ingresa hora de fin';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-heading">Identificación</h3>
      <p className="text-sm text-muted-foreground">Datos del equipo y la reunión</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Equipo Ministerial" error={errors.groupId} required>
          <select
            value={data.groupId}
            onChange={(e) => onChange({ groupId: e.target.value })}
            className="input-field"
          >
            <option value="">Selecciona...</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.code ? `${g.code} - ` : ''}{g.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Código de Célula" error={errors.cellCode} required>
          <div className="relative">
            <input
              type="text"
              value={data.cellCode}
              onChange={(e) => onChange({ cellCode: e.target.value })}
              placeholder="Ej: E5.1"
              className="input-field"
            />
            {lookupLoading && (
              <span className="absolute right-3 top-2.5 text-xs text-muted-foreground animate-pulse">...</span>
            )}
          </div>
        </Field>

        <Field label="Fecha de Reunión" error={errors.meetingDate} required>
          <input
            type="date"
            value={data.meetingDate}
            onChange={(e) => onChange({ meetingDate: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="input-field"
          />
        </Field>

        <Field label="Cobertura">
          <input
            type="text"
            value={data.coverageName}
            onChange={(e) => onChange({ coverageName: e.target.value })}
            placeholder="Auto-detectado"
            className="input-field"
          />
        </Field>

        <Field label="Líder" error={errors.leaderName} required>
          <input
            type="text"
            value={data.leaderName}
            onChange={(e) => onChange({ leaderName: e.target.value })}
            className="input-field"
          />
        </Field>

        <Field label="Co-líder">
          <input
            type="text"
            value={data.coLeaderName}
            onChange={(e) => onChange({ coLeaderName: e.target.value })}
            className="input-field"
          />
        </Field>

        <Field label="Hora Inicio" error={errors.startTime} required>
          <input type="time" value={data.startTime} onChange={(e) => onChange({ startTime: e.target.value })} className="input-field" />
        </Field>

        <Field label="Hora Fin" error={errors.endTime} required>
          <input type="time" value={data.endTime} onChange={(e) => onChange({ endTime: e.target.value })} className="input-field" />
        </Field>
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={handleNext} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          Siguiente →
        </button>
      </div>
    </div>
  );
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
