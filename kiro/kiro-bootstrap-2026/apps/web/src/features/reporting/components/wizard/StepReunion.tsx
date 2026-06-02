'use client';

import type { WizardFormData } from './ReportWizard';

interface Props {
  data: WizardFormData;
  onChange: (partial: Partial<WizardFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StepReunion({ data, onChange, onNext, onPrev }: Props) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-heading">Reunión</h3>
      <p className="text-sm text-muted-foreground">Detalles adicionales y observaciones</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Tema del mensaje</label>
          <input
            type="text"
            value={data.messageTopic}
            onChange={(e) => onChange({ messageTopic: e.target.value })}
            placeholder="Tema de la enseñanza"
            className="input-field"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Ofrenda (B/.)</label>
          <input
            type="number"
            value={data.offeringAmount ?? ''}
            onChange={(e) => onChange({ offeringAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
            placeholder="0.00"
            min={0}
            step="0.01"
            className="input-field"
          />
        </div>
      </div>

      {/* Ubicación */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" value={data.district} onChange={(e) => onChange({ district: e.target.value })} placeholder="Corregimiento" className="input-field" />
          <input type="text" value={data.neighborhood} onChange={(e) => onChange({ neighborhood: e.target.value })} placeholder="Barriada" className="input-field" />
          <input type="text" value={data.street} onChange={(e) => onChange({ street: e.target.value })} placeholder="Calle" className="input-field" />
          <input type="text" value={data.houseNumber} onChange={(e) => onChange({ houseNumber: e.target.value })} placeholder="Casa #" className="input-field" />
        </div>
      </div>

      {/* Supervisión */}
      <div className="flex items-center gap-3 py-2">
        <input
          type="checkbox"
          id="wasSupervised"
          checked={data.wasSupervised}
          onChange={(e) => onChange({ wasSupervised: e.target.checked })}
          className="h-4 w-4 rounded border-input accent-primary"
        />
        <label htmlFor="wasSupervised" className="text-sm font-medium">¿La reunión fue supervisada?</label>
      </div>

      {/* Observaciones */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Observaciones</label>
        <textarea
          value={data.observations}
          onChange={(e) => onChange({ observations: e.target.value })}
          placeholder="Testimonios, necesidades, notas pastorales..."
          rows={4}
          className="input-field min-h-[100px] resize-none"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button onClick={onPrev} className="px-4 py-2 text-sm border rounded-lg hover:bg-muted/50 transition-colors">
          ← Anterior
        </button>
        <button onClick={onNext} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          Revisar →
        </button>
      </div>
    </div>
  );
}
