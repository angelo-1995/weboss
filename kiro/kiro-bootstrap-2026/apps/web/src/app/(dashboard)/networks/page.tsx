'use client';

import { useState, useCallback, useEffect } from 'react';
import { Plus, Pencil, Trash2, UserPlus, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserSearchInput } from '@/components/forms/user-search-input';
import { NetworkTree } from '@/features/networks/components/network-tree';
import { NetworkCard } from '@/features/networks/components/network-card';
import { useNetworks } from '@/features/networks/hooks/use-networks';
import { api } from '@/lib/api-client';
import type { Network } from '@/features/networks/types/network.types';

interface FlatNetwork {
  id: string;
  code: string;
  name: string;
  parentNetworkId: string | null;
  parentName: string | null;
}

function flattenForSelect(nodes: Network[], parentName: string | null = null): FlatNetwork[] {
  const result: FlatNetwork[] = [];
  for (const node of nodes) {
    result.push({
      id: node.id,
      code: node.code,
      name: node.name,
      parentNetworkId: node.parentNetworkId,
      parentName,
    });
    if (node.children && node.children.length > 0) {
      result.push(...flattenForSelect(node.children, node.name));
    }
  }
  return result;
}

export default function NetworksPage() {
  const { data: networks, isLoading, refetch } = useNetworks();
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Create form
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newParent, setNewParent] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit form
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editParent, setEditParent] = useState('');
  const [saving, setSaving] = useState(false);

  // Assign form
  const [assignRole, setAssignRole] = useState('PASTOR');

  const [error, setError] = useState('');

  const flatNetworks = networks ? flattenForSelect(networks) : [];

  const handleCreate = async () => {
    if (!newCode.trim() || !newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      await api.post('/networks', {
        code: newCode.trim(),
        name: newName.trim(),
        parentNetworkId: newParent || undefined,
      });
      setNewCode('');
      setNewName('');
      setNewParent('');
      setCreateOpen(false);
      refetch();
    } catch (err: any) {
      setError(err.message ?? 'Error al crear la red');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedNetwork) return;
    setSaving(true);
    setError('');
    try {
      await api.patch(`/networks/${selectedNetwork.id}`, {
        code: editCode.trim() || undefined,
        name: editName.trim() || undefined,
        parentNetworkId: editParent || null,
      });
      setEditOpen(false);
      refetch();
    } catch (err: any) {
      setError(err.message ?? 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNetwork) return;
    try {
      await api.delete(`/networks/${selectedNetwork.id}`);
      setDeleteConfirm(false);
      setSelectedNetwork(null);
      refetch();
    } catch (err: any) {
      setError(err.message ?? 'Error al eliminar');
      setDeleteConfirm(false);
    }
  };

  const handleAssignLeader = async (userId: string) => {
    if (!selectedNetwork) return;
    try {
      await api.post(`/networks/${selectedNetwork.id}/leaders`, { userId, role: assignRole });
      setAssignOpen(false);
      setAssignRole('PASTOR');
      refetch();
    } catch {
      // silently fail
    }
  };

  const handleRemoveLeader = async (userId: string) => {
    if (!selectedNetwork) return;
    try {
      await api.delete(`/networks/${selectedNetwork.id}/leaders/${userId}`);
      refetch();
    } catch {
      // silently fail
    }
  };

  const openEdit = () => {
    if (!selectedNetwork) return;
    setEditCode(selectedNetwork.code);
    setEditName(selectedNetwork.name);
    setEditParent(selectedNetwork.parentNetworkId || '');
    setEditOpen(true);
    setError('');
  };

  // Update selectedNetwork when data refreshes
  useEffect(() => {
    if (selectedNetwork && networks) {
      const findNetwork = (nodes: Network[]): Network | null => {
        for (const n of nodes) {
          if (n.id === selectedNetwork.id) return n;
          if (n.children) {
            const found = findNetwork(n.children);
            if (found) return found;
          }
        }
        return null;
      };
      const updated = findNetwork(networks);
      if (updated) setSelectedNetwork(updated);
    }
  }, [networks]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Gestión de Redes" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Gestión de Redes" description="Administra las redes y asigna pastores">
        <Button onClick={() => { setCreateOpen(true); setError(''); }}>
          <Plus className="h-4 w-4" />
          Crear Red
        </Button>
      </PageHeader>

      {error && !createOpen && !editOpen && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Main layout: Tree + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Tree panel */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Estructura de Redes</h2>
          <NetworkTree
            networks={networks ?? []}
            selectedId={selectedNetwork?.id ?? null}
            onSelect={setSelectedNetwork}
          />
        </div>

        {/* Detail panel */}
        <div>
          {selectedNetwork ? (
            <div className="space-y-3">
              <NetworkCard network={selectedNetwork} />
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={openEdit}>
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAssignOpen(true)}>
                  <UserPlus className="h-3.5 w-3.5 mr-1" />
                  Agregar Pastor
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteConfirm(true)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
              Selecciona una red del árbol para ver sus detalles
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Crear Red</h2>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Código</label>
                <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="Ej: RED-01" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Nombre</label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre de la red" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Red padre (opcional)</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={newParent}
                  onChange={(e) => setNewParent(e.target.value)}
                >
                  <option value="">Sin red padre</option>
                  {flatNetworks.map((n) => (
                    <option key={n.id} value={n.id}>{n.name} ({n.code})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? 'Creando...' : 'Crear'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Editar Red</h2>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Código</label>
                <Input value={editCode} onChange={(e) => setEditCode(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Nombre</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Red padre</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={editParent}
                  onChange={(e) => setEditParent(e.target.value)}
                >
                  <option value="">Sin red padre</option>
                  {flatNetworks.filter((n) => n.id !== selectedNetwork?.id).map((n) => (
                    <option key={n.id} value={n.id}>{n.name} ({n.code})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button onClick={handleEdit} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Leader Modal */}
      {assignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Agregar Pastor</h2>
            <p className="text-sm text-muted-foreground">Busca y selecciona el usuario a asignar.</p>
            <div className="space-y-1">
              <label className="text-sm font-medium">Rol</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={assignRole}
                onChange={(e) => setAssignRole(e.target.value)}
              >
                <option value="PASTOR">Pastor</option>
                <option value="CO_PASTOR">Co-Pastor</option>
                <option value="SUPERVISOR">Supervisor</option>
              </select>
            </div>
            <UserSearchInput
              placeholder="Buscar usuario..."
              onSelect={(user) => handleAssignLeader(user.id)}
            />
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border rounded-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">Confirmar eliminación</h2>
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de eliminar la red &quot;{selectedNetwork?.name}&quot;? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
