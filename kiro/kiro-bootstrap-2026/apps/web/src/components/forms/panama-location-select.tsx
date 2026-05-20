'use client';

import { useMemo } from 'react';
import { PANAMA_GEO, getDistricts, getCorregimientos } from '@/lib/panama-geo';

export interface PanamaLocationValue {
  province: string;
  district: string;
  corregimiento: string;
}

interface PanamaLocationSelectProps {
  value: PanamaLocationValue;
  onChange: (value: PanamaLocationValue) => void;
}

export function PanamaLocationSelect({ value, onChange }: PanamaLocationSelectProps) {
  const provinces = PANAMA_GEO.provinces.map(p => p.name);

  const districts = useMemo(() => {
    return value.province ? getDistricts(value.province) : [];
  }, [value.province]);

  const corregimientos = useMemo(() => {
    return value.province && value.district
      ? getCorregimientos(value.province, value.district)
      : [];
  }, [value.province, value.district]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <label className="text-sm font-medium">Provincia</label>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={value.province}
          onChange={(e) =>
            onChange({ province: e.target.value, district: '', corregimiento: '' })
          }
        >
          <option value="">Seleccionar provincia</option>
          {provinces.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Distrito</label>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={value.district}
          disabled={!value.province}
          onChange={(e) =>
            onChange({ ...value, district: e.target.value, corregimiento: '' })
          }
        >
          <option value="">Seleccionar distrito</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1 col-span-2">
        <label className="text-sm font-medium">Corregimiento</label>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={value.corregimiento}
          disabled={!value.district}
          onChange={(e) =>
            onChange({ ...value, corregimiento: e.target.value })
          }
        >
          <option value="">Seleccionar corregimiento</option>
          {corregimientos.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
