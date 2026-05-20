'use client';

import { X, User, Clock, Globe, Monitor } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AuditLog } from '../types/audit.types';

interface AuditDetailPanelProps {
  log: AuditLog | null;
  onClose: () => void;
}

function ValueDisplay({ label, value }: { label: string; value: Record<string, unknown> | null }) {
  if (!value || Object.keys(value).length === 0) {
    return (
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
        <p className="text-sm text-muted-foreground italic">Sin datos</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      <div className="space-y-1 rounded-md bg-muted/50 p-3 text-sm font-mono">
        {Object.entries(value).map(([key, val]) => (
          <div key={key} className="flex gap-2">
            <span className="text-muted-foreground shrink-0">{key}:</span>
            <span className="text-foreground break-all">
              {val === null ? 'null' : String(val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuditDetailPanel({ log, onClose }: AuditDetailPanelProps) {
  if (!log) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg border-l bg-background shadow-xl overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
        <h2 className="text-lg font-semibold">Detalle de Auditoría</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* Meta info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Usuario</p>
              <p className="text-sm font-medium">
                {log.user
                  ? `${log.user.firstName} ${log.user.lastName}`
                  : 'Sistema'}
              </p>
              {log.user && (
                <p className="text-xs text-muted-foreground">{log.user.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Fecha/Hora</p>
              <p className="text-sm font-medium">
                {new Date(log.createdAt).toLocaleString('es-PA', {
                  dateStyle: 'medium',
                  timeStyle: 'medium',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Globe className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">IP</p>
              <p className="text-sm font-mono">{log.ipAddress ?? '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Monitor className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">User Agent</p>
              <p className="text-xs text-muted-foreground break-all">
                {log.userAgent ?? '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Action & Resource */}
        <div className="flex items-center gap-3">
          <Badge
            className={
              log.action === 'CREATE'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : log.action === 'UPDATE'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  : log.action === 'DELETE'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
            }
          >
            {log.action}
          </Badge>
          <span className="text-sm">
            <span className="font-medium">{log.resource}</span>
            {log.resourceId && (
              <span className="text-muted-foreground font-mono ml-1">
                ({log.resourceId})
              </span>
            )}
          </span>
        </div>

        {/* Values diff */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Cambios</h3>
          <div className="flex gap-4">
            <ValueDisplay label="Valores anteriores" value={log.oldValues} />
            <ValueDisplay label="Valores nuevos" value={log.newValues} />
          </div>
        </div>
      </div>
    </div>
  );
}
