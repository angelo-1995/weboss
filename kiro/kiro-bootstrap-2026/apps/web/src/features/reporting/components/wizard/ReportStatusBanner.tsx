'use client';

import { Clock, AlertTriangle, Lock, CheckCircle2, FileEdit } from 'lucide-react';
import type { ReportStatus } from './ReportWizard';

interface Props {
  status: ReportStatus;
  periodInfo: any;
}

const STATUS_CONFIG: Record<ReportStatus, {
  icon: typeof Clock;
  label: string;
  description: string;
  className: string;
}> = {
  draft: {
    icon: FileEdit,
    label: 'Borrador',
    description: 'Tienes un reporte en progreso. Se guarda automáticamente.',
    className: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  },
  open: {
    icon: CheckCircle2,
    label: 'Período Abierto',
    description: 'Puedes enviar tu reporte normalmente.',
    className: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
  },
  late: {
    icon: Clock,
    label: 'Envío Tardío',
    description: 'Estás fuera del domingo pero aún puedes enviar hasta el miércoles.',
    className: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
  },
  closed: {
    icon: Lock,
    label: 'Período Cerrado',
    description: 'El período de envío para esta semana ha cerrado (jueves en adelante). Contacta a tu cobertura si necesitas reportar.',
    className: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  },
  submitted: {
    icon: CheckCircle2,
    label: 'Reporte Enviado',
    description: 'Tu reporte de esta semana ya fue enviado exitosamente.',
    className: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
  },
};

export function ReportStatusBanner({ status, periodInfo }: Props) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border p-4 flex items-start gap-3 ${config.className}`}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold">{config.label}</p>
        <p className="text-xs mt-0.5 opacity-80">{config.description}</p>
        {periodInfo?.deadlineDate && status !== 'closed' && (
          <p className="text-xs mt-1 opacity-60">
            Fecha límite: {new Date(periodInfo.deadlineDate).toLocaleDateString('es-PA', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>
    </div>
  );
}
