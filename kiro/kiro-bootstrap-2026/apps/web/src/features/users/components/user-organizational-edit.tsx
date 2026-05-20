'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';

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

interface UserSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  leaderCode?: string | null;
}

interface UserOrganizationalEditProps {
  userId: string;
  leaderCode: string | null;
  ministerialRole: string | null;
  leaderId: string | null;
  leaderName: string | null;
  networkId: string | null;
  onSaved: () => void;
}

export function UserOrganizationalEdit({
  userId,
  leaderCode: initialLeaderCode,
  ministerialRole: initialMinisterialRole,
  leaderId: initialLeaderId,
  leaderName: initialLeaderName,
  networkId: initialNetworkId,
  onSaved,
}: UserOrganizationalEditProps) {
  const [leaderCode, setLeaderCode] = useState(initialLeaderCode ?? '');
  const [ministerialRole, setMinisterialRole] = useState(initialMinisterialRole ?? '');
  const [leaderId, setLeaderId] = useState(initialLeaderId ?? '');
  const [networkId, setNetworkId] = useState(initialNetworkId ?? '');
  const [saving, setSaving] = useState(false);

  // Networks
  const [networks, setNetworks] = useState<Network[]>([]);

  // User search for cobertura
  const [leaderSearch, setLeaderSearch] = useState(initialLeaderName ?? '');
  const [leaderResults, setLeaderResults] = useState<UserSearchResult[]>([]);
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);

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

  // Search users for cobertura
  useEffect(() => {
    if (!leaderSearch || leaderSearch.length < 2) {
      setLeaderResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get<{ data: UserSearchResult[] }>('/users', {
          search: leaderSearch,
          pageSize: 8,
        });
        setLeaderResults(res.data ?? []);
      } catch {
        setLeaderResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [leaderSearch]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/users/${userId}`, {
        leaderCode: leaderCode || null,
        ministerialRole: ministerialRole || null,
        leaderId: leaderId || null,
        networkId: networkId || null,
      });
      onSaved();
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };

  const selectLeader = (user: UserSearchResult) => {
    setLeaderId(user.id);
    setLeaderSearch(`${user.firstName} ${user.lastName}${user.leaderCode ? ` (${user.leaderCode})` : ''}`);
    setShowLeaderDropdown(false);
  };

  const clearLeader = () => {
    setLeaderId('');
    setLeaderSearch('');
  };

  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <h3 className="text-base font-semibold">Configuración Organizacional</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Código de líder */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Código de líder</label>
          <input
            type="text"
            value={leaderCode}
            onChange={(e) => setLeaderCode(e.target.value)}
            placeholder="Ej: E5.1"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            {MINISTERIAL_ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Cobertura (user search) */}
        <div className="space-y-1 relative">
          <label className="text-sm font-medium">Cobertura</label>
          <div className="flex gap-1">
            <input
              type="text"
              value={leaderSearch}
              onChange={(e) => {
                setLeaderSearch(e.target.value);
                setShowLeaderDropdown(true);
              }}
              onFocus={() => setShowLeaderDropdown(true)}
              placeholder="Buscar líder..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {leaderId && (
              <button
                type="button"
                onClick={clearLeader}
                className="text-xs text-muted-foreground hover:text-foreground px-2"
              >
                ✕
              </button>
            )}
          </div>
          {showLeaderDropdown && leaderResults.length > 0 && (
            <div className="absolute z-10 top-full mt-1 w-full bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
              {leaderResults
                .filter((u) => u.id !== userId)
                .map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => selectLeader(u)}
                  >
                    {u.firstName} {u.lastName}
                    {u.leaderCode && <span className="text-xs text-muted-foreground ml-1">({u.leaderCode})</span>}
                  </button>
                ))}
            </div>
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

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  );
}
