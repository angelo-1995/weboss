'use client';

import { Users, Layers, Network as NetworkIcon, Hash } from 'lucide-react';
import type { Network } from '../types/network.types';

interface NetworkCardProps {
  network: Network;
}

export function NetworkCard({ network }: NetworkCardProps) {
  const leaderCount = network.leaders?.length ?? 0;
  const memberCount = network._count?.users ?? 0;
  const groupCount = network._count?.groups ?? 0;

  return (
    <div className="rounded-lg border bg-card p-5 space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{network.name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Hash className="h-3.5 w-3.5" />
          <span className="font-mono">{network.code}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md border p-3 text-center">
          <Layers className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-semibold">{leaderCount}</p>
          <p className="text-xs text-muted-foreground">Pastores</p>
        </div>
        <div className="rounded-md border p-3 text-center">
          <Users className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-semibold">{memberCount}</p>
          <p className="text-xs text-muted-foreground">Miembros</p>
        </div>
        <div className="rounded-md border p-3 text-center">
          <NetworkIcon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-semibold">{groupCount}</p>
          <p className="text-xs text-muted-foreground">Grupos</p>
        </div>
      </div>

      {/* Parent */}
      {network.parentNetworkId && (
        <div className="text-sm">
          <span className="text-muted-foreground">Red padre: </span>
          <span className="font-medium">{network.parentNetworkId}</span>
        </div>
      )}

      {/* Leaders */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Pastores asignados</h4>
        {leaderCount === 0 ? (
          <p className="text-sm text-muted-foreground">Sin pastores asignados</p>
        ) : (
          <div className="space-y-1.5">
            {network.leaders!.map((leader) => (
              <div
                key={leader.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <span className="text-sm">
                  {leader.user
                    ? `${leader.user.firstName} ${leader.user.lastName}`
                    : leader.userId}
                </span>
                <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5 font-medium">
                  {leader.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Children count */}
      {network.children && network.children.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {network.children.length} sub-red{network.children.length > 1 ? 'es' : ''}
        </div>
      )}
    </div>
  );
}
