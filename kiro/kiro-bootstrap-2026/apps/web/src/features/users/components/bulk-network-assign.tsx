'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Network {
  id: string;
  name: string;
  code: string;
}

interface BulkNetworkAssignProps {
  open: boolean;
  onClose: () => void;
}

export function BulkNetworkAssign({ open, onClose }: BulkNetworkAssignProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    async function load() {
      try {
        const [usersRes, networksRes] = await Promise.all([
          api.get<any>('/users', { pageSize: 200 }),
          api.get<any>('/networks'),
        ]);
        setUsers(usersRes.data || []);
        // Networks come as a tree — flatten them
        const flatNetworks: Network[] = [];
        function flatten(nodes: any[]) {
          for (const n of nodes) {
            flatNetworks.push({ id: n.id, name: n.name, code: n.code });
            if (n.children?.length) flatten(n.children);
          }
        }
        const netData = Array.isArray(networksRes) ? networksRes : [];
        flatten(netData);
        setNetworks(flatNetworks);
      } catch {
        // ignore
      }
    }
    load();
  }, [open]);

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedUsers.size === 0 || !selectedNetwork) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await api.patch<{ updated: number }>('/users/bulk-network', {
        userIds: Array.from(selectedUsers),
        networkId: selectedNetwork,
      });
      setResult(`✅ ${res.updated} usuarios actualizados correctamente`);
      setSelectedUsers(new Set());
    } catch (err: any) {
      setResult(`❌ Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg border shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Asignar Red en Lote</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Network selector */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Red destino</label>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Selecciona una red</option>
              {networks.map((n) => (
                <option key={n.id} value={n.id}>{n.name} ({n.code})</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />

          {/* Users table */}
          <div className="flex-1 overflow-y-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="p-2 text-left w-8">
                    <input type="checkbox" onChange={toggleAll} checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0} />
                  </th>
                  <th className="p-2 text-left">Nombre</th>
                  <th className="p-2 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-muted/50">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(u.id)}
                        onChange={() => toggleUser(u.id)}
                      />
                    </td>
                    <td className="p-2">{u.firstName} {u.lastName}</td>
                    <td className="p-2 text-muted-foreground">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result && (
            <p className="text-sm">{result}</p>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t">
          <span className="text-sm text-muted-foreground">
            {selectedUsers.size} seleccionados
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || selectedUsers.size === 0 || !selectedNetwork}
              type="button"
            >
              {submitting ? 'Asignando...' : 'Asignar Red'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
