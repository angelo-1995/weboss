'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';

interface PromoteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    spiritualStage: string | null;
  };
  onSuccess: () => void;
}

interface Milestones {
  isBaptized: boolean;
  baptizedDate: string | null;
  hasFirstRetreat: boolean;
  retreatDate: string | null;
  hasAcademy: boolean;
  academyDate: string | null;
  hasLaunch: boolean;
  launchDate: string | null;
}

const STAGE_LABELS: Record<string, string> = {
  GANADO: 'Ganado',
  CONSOLIDADO: 'Consolidado',
  DISCIPULADO: 'Discipulado',
  ENVIADO: 'Enviado',
};

const NEXT_STAGE: Record<string, string> = {
  GANADO: 'CONSOLIDADO',
  CONSOLIDADO: 'DISCIPULADO',
  DISCIPULADO: 'ENVIADO',
};

export function PromoteUserModal({ open, onOpenChange, user, onSuccess }: PromoteUserModalProps) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [milestones, setMilestones] = useState<Milestones | null>(null);

  const nextStage = user.spiritualStage ? NEXT_STAGE[user.spiritualStage] : null;
  const needsLaunch = nextStage === 'ENVIADO' && milestones && !milestones.hasLaunch;

  useEffect(() => {
    if (!open) return;
    api.get<Milestones>(`/users/${user.id}/milestones`)
      .then(setMilestones)
      .catch(() => {});
  }, [user.id, open]);

  const handlePromote = async () => {
    if (!nextStage) return;
    setLoading(true);

    try {
      await api.post(`/users/${user.id}/promote`, {
        toStage: nextStage,
        ...(notes && { notes }),
      });
      toast.success(`${user.firstName} promovido a ${STAGE_LABELS[nextStage]}`);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al promover usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promover Usuario</DialogTitle>
          <DialogDescription>
            Promover a {user.firstName} {user.lastName} a la siguiente etapa espiritual
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center">
              <p className="text-xs text-muted-foreground mb-1">Etapa actual</p>
              <span className="inline-block bg-muted px-3 py-1 rounded text-sm font-medium">
                {STAGE_LABELS[user.spiritualStage ?? ''] || user.spiritualStage || 'Sin asignar'}
              </span>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex-1 text-center">
              <p className="text-xs text-muted-foreground mb-1">Nueva etapa</p>
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded text-sm font-medium">
                {STAGE_LABELS[nextStage ?? ''] || nextStage || '—'}
              </span>
            </div>
          </div>

          {/* Milestones Status */}
          {milestones && (
            <div className="rounded-md border p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">Hitos Espirituales</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={milestones.isBaptized ? 'text-green-600' : 'text-muted-foreground'}>
                    {milestones.isBaptized ? '✓' : '○'}
                  </span>
                  <span>Bautizado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={milestones.hasFirstRetreat ? 'text-green-600' : 'text-muted-foreground'}>
                    {milestones.hasFirstRetreat ? '✓' : '○'}
                  </span>
                  <span>Primer Retiro</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={milestones.hasAcademy ? 'text-green-600' : 'text-muted-foreground'}>
                    {milestones.hasAcademy ? '✓' : '○'}
                  </span>
                  <span>Academia</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={milestones.hasLaunch ? 'text-green-600' : 'text-muted-foreground'}>
                    {milestones.hasLaunch ? '✓' : '○'}
                  </span>
                  <span>Lanzamiento</span>
                </div>
              </div>
            </div>
          )}

          {/* Warning for ENVIADO without Lanzamiento */}
          {needsLaunch && (
            <div className="rounded-md border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                ⚠️ Debe completar Lanzamiento primero
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                El usuario necesita completar el hito de Lanzamiento antes de ser promovido a Enviado.
              </p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">Notas <span className="text-muted-foreground">(opcional)</span></label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              placeholder="Observaciones sobre la promoción..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePromote}
            disabled={loading || !!needsLaunch || !nextStage}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar Promoción
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
