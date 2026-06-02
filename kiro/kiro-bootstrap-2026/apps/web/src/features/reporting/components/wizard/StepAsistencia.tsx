'use client';

import { Minus, Plus } from 'lucide-react';
import type { WizardFormData } from './ReportWizard';

interface Props {
  data: WizardFormData;
  onChange: (partial: Partial<WizardFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

type AttendanceField = 'menCount' | 'womenCount' | 'youthMaleCount' | 'youthFemaleCount' | 'childrenCount' | 'visitorsCount' | 'convertsCount' | 'reconciledCount';

const ATTENDANCE_FIELDS: Array<{ key: AttendanceField; label: string; emoji: string }> = [
  { key: 'menCount', label: 'Hombres', emoji: '👨' },
  { key: 'womenCount', label: 'Mujeres', emoji: '👩' },
  { key: 'youthMaleCount', label: 'Jóvenes (H)', emoji: '🧑' },
  { key: 'youthFemaleCount', label: 'Jóvenes (M)', emoji: '👧' },
  { key: 'childrenCount', label: 'Niños', emoji: '👶' },
  { key: 'visitorsCount', label: 'Visitantes', emoji: '🆕' },
  { key: 'convertsCount', label: 'Convertidos', emoji: '✝️' },
  { key: 'reconciledCount', label: 'Reconciliados', emoji: '🤝' },
];

export function StepAsistencia({ data, onChange, onNext, onPrev }: Props) {
  const totalAttendance = data.menCount + data.womenCount + data.youthMaleCount + data.youthFemaleCount + data.childrenCount;

  const increment = (field: AttendanceField) => {
    const current = data[field] ?? 0;
    if (current < 999) onChange({ [field]: current + 1 });
  };

  const decrement = (field: AttendanceField) => {
    const current = data[field] ?? 0;
    if (current > 0) onChange({ [field]: current - 1 });
  };

  const setDirect = (field: AttendanceField, value: string) => {
    const num = parseInt(value) || 0;
    onChange({ [field]: Math.min(999, Math.max(0, num)) });
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-heading">Asistencia</h3>
      <p className="text-sm text-muted-foreground">Registra la asistencia de la reunión</p>

      <div className="space-y-3">
        {ATTENDANCE_FIELDS.map(({ key, label, emoji }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <span className="text-base">{emoji}</span>
              {label}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => decrement(key)}
                className="h-10 w-10 rounded-lg border flex items-center justify-center hover:bg-muted/50 active:scale-95 transition-all touch-manipulation"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                value={data[key]}
                onChange={(e) => setDirect(key, e.target.value)}
                className="h-10 w-16 text-center text-lg font-bold border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min={0}
                max={999}
              />
              <button
                type="button"
                onClick={() => increment(key)}
                className="h-10 w-10 rounded-lg border flex items-center justify-center hover:bg-muted/50 active:scale-95 transition-all touch-manipulation bg-primary/5"
              >
                <Plus className="h-4 w-4 text-primary" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Asistencia</p>
        <p className="text-3xl font-heading text-primary">{totalAttendance}</p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button onClick={onPrev} className="px-4 py-2 text-sm border rounded-lg hover:bg-muted/50 transition-colors">
          ← Anterior
        </button>
        <button onClick={onNext} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          Siguiente →
        </button>
      </div>
    </div>
  );
}
