'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserSearchInput } from '@/components/forms/user-search-input';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const MINISTERIAL_ROLES = [
  { value: 'PASTOR_GENERAL', label: 'Pastor General' },
  { value: 'PASTOR_RED', label: 'Pastor de Red' },
  { value: 'COBERTURA', label: 'Cobertura' },
  { value: 'LIDER', label: 'Líder' },
  { value: 'ESTACA', label: 'Estaca' },
  { value: 'MIEMBRO', label: 'Miembro' },
] as const;

interface Network {
  id: string;
  name: string;
  code: string;
}

interface OrgConfigSectionProps {
  userId: string;
  leaderCode: string | null;
  ministerialRole: string | null;
  leaderId: string | null;
  leaderName: string | null;
  networkId: string | null;
  networkName?: string | null;
  spiritualStage?: string | null;
  hasLaunch?: boolean;
  onSaved?: () => void;
}

export function OrgConfigSection({
  userId,
  leaderCode: initialLeaderCode,
  ministerialRole: initialMinisterialRole,
  leaderId: initialLeaderId,
  leaderName: initialLeaderName,
  networkId: initialNetworkId,
  networkName: initialNetworkName,
  spiritualStage,
  hasLaunch,
  onSaved,
}: OrgConfigSectionProps) {
  const { user: authUser } = useAuthStore();
  const isAdmin = authUser?.roles?.includes('ADMIN') || authUser?.roles?.includes('SUPER_ADMIN');

  // Determine which roles are available based on spiritual stage and launch status
  const canBeLeader = spiritualStage === 'ENVIADO' && hasLaunch === true;
  const availableRoles = canBeLeader
    ? MINISTERIAL_ROLES
    : MINISTERIAL_ROLES.filter(r => r.value === 'MIEMBRO' || r.value === 'ESTACA');

  const [expanded, setExpanded] = useState(false);
  const [leaderCode, setLeaderCode] = useState(initialLeaderCode ?? '');
  const [ministerialRole, setMinisterialRole] = useState(initialMinisterialRole ?? '');
  const [leaderId, setLeaderId] = useState(initialLeaderId ?? '');
  const [leaderDisplay, setLeaderDisplay] = useState(initialLeaderName ?? '');
  const [networkId, setNetworkId] = useState(initialNetworkId ?? '');
  const [saving, setSaving] = useState(false);
  const [networks, setNetworks] = useState<Network[]>([]);

  useEffect(() => {
    async function loadNetworks() {
      try {
        const res = await api.get<any[]>('/networks');
        const flat: Network[] = [];
        function flatten(nodes: any[]) {
          for (const n of nodes) {
            flat.push({ id: n.id, name: n.name, code: n.code });
            if (n.children?.length) flatten(n.children);
          }
        }
        flatten(Array.isArray(res) ? res : []);
        setNetworks(flat);
      } catch { /* ignore */ }
    }
    loadNetworks();
  }, []);

  // Sync props when they change (e.g. after save)
  useEffect(() => {
    setLeaderCode(initialLeaderCode ?? '');
    setMinisterialRole(initialMinisterialRole ?? '');
    setLeaderId(initialLeaderId ?? '');
    setLeaderDisplay(initialLeaderName ?? '');
    setNetworkId(initialNetworkId ?? '');
  }, [initialLeaderCode, initialMinisterialRole, initialLeaderId, initialLeaderName, initialNetworkId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/users/${userId}`, {
        leaderCode: leaderCode || null,
        ministerialRole: ministerialRole || null,
        leaderId: leaderId || null,
        networkId: networkId || null,
      });
      toast.success('Configuración organizacional guardada');
      setExpanded(false);
      onSaved?.();
    } catch (err: any) {
      toast.error(err?.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to initial values
    setLeaderCode(initialLeaderCode ?? '');
    setMinisterialRole(initialMinisterialRole ?? '');
    setLeaderId(initialLeaderId ?? '');
    setLeaderDisplay(initialLeaderName ?? '');
    setNetworkId(initialNetworkId ?? '');
    setExpanded(false);
  };

  const roleLabel = MINISTERIAL_ROLES.find(r => r.value === initialMinisterialRole)?.label ?? 'Sin asignar';
  const currentNetworkName = initialNetworkName ?? networks.find(n => n.id === initialNetworkId)?.name ?? 'Sin red';

  // Collapsed read-only view
  if (!expanded) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Configuración Organizacional</h3>
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(true)}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-foreground">Código:</span>
            {initialLeaderCode || 'Sin asignar'}
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-foreground">Rol:</span>
            {roleLabel}
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-foreground">Cobertura:</span>
            {initialLeaderName || 'Sin asignar'}
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-foreground">Red:</span>
            {currentNetworkName}
          </span>
        </div>
      </div>
    );
  }

  // Expanded editable view (only admins reach here)
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <h3 className="text-base font-semibold">Configuración Organizacional</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Código de líder */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Código de líder</label>
          <Input
            value={leaderCode}
            onChange={(e) => setLeaderCode(e.target.value)}
            placeholder="Ej: E5.1"
          />
        </div>

        {/* Rol ministerial */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Rol ministerial</label>
          <select
            value={ministerialRole}
            onChange={(e) => setMinisterialRole(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Sin asignar</option>
            {availableRoles.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          {!canBeLeader && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              ⚠️ Para asignar roles de liderazgo, el usuario debe completar Lanzamiento y estar en etapa Enviado
            </p>
          )}
        </div>

        {/* Cobertura */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Cobertura</label>
          <UserSearchInput
            placeholder="Buscar líder de cobertura..."
            onSelect={(user) => {
              setLeaderId(user.id);
              setLeaderDisplay(`${user.firstName} ${user.lastName}`);
            }}
          />
          {leaderDisplay && (
            <p className="text-xs text-muted-foreground">Seleccionado: {leaderDisplay}</p>
          )}
        </div>

        {/* Red */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Red</label>
          <select
            value={networkId}
            onChange={(e) => setNetworkId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Sin red</option>
            {networks.map((n) => (
              <option key={n.id} value={n.id}>{n.name} ({n.code})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}
