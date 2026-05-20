'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Users, Layers } from 'lucide-react';
import { cn } from '@community-os/ui';
import type { Network } from '../types/network.types';

const NETWORK_COLORS: Record<string, string> = {
  'RED-01': 'border-l-blue-500',
  'RED-02': 'border-l-emerald-500',
  'RED-03': 'border-l-purple-500',
  'RED-04': 'border-l-amber-500',
  'RED-05': 'border-l-rose-500',
  'RED-06': 'border-l-cyan-500',
  'RED-07': 'border-l-orange-500',
  'RED-08': 'border-l-indigo-500',
};

function getColorClass(code: string): string {
  if (NETWORK_COLORS[code]) return NETWORK_COLORS[code];
  // Fallback: hash the code to pick a color
  const colors = [
    'border-l-blue-500',
    'border-l-emerald-500',
    'border-l-purple-500',
    'border-l-amber-500',
    'border-l-rose-500',
    'border-l-cyan-500',
    'border-l-orange-500',
    'border-l-indigo-500',
  ];
  const hash = code.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

interface NetworkTreeNodeProps {
  network: Network;
  depth: number;
  selectedId: string | null;
  onSelect: (network: Network) => void;
}

function NetworkTreeNode({ network, depth, selectedId, onSelect }: NetworkTreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = network.children && network.children.length > 0;
  const isSelected = selectedId === network.id;
  const colorClass = getColorClass(network.code);

  const leaderCount = network.leaders?.length ?? 0;
  const memberCount = network._count?.users ?? 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(network)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-colors border-l-2',
          colorClass,
          isSelected
            ? 'bg-primary/10 text-foreground font-medium'
            : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground',
        )}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {hasChildren ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="shrink-0 cursor-pointer"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        <span className="flex-1 truncate">{network.name}</span>

        <span className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          {leaderCount > 0 && (
            <span className="flex items-center gap-0.5" title="Pastores">
              <Layers className="h-3 w-3" />
              {leaderCount}
            </span>
          )}
          {memberCount > 0 && (
            <span className="flex items-center gap-0.5" title="Miembros">
              <Users className="h-3 w-3" />
              {memberCount}
            </span>
          )}
        </span>
      </button>

      {hasChildren && expanded && (
        <div>
          {network.children!.map((child) => (
            <NetworkTreeNode
              key={child.id}
              network={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface NetworkTreeProps {
  networks: Network[];
  selectedId: string | null;
  onSelect: (network: Network) => void;
}

export function NetworkTree({ networks, selectedId, onSelect }: NetworkTreeProps) {
  if (networks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No hay redes registradas
      </p>
    );
  }

  return (
    <div className="space-y-0.5">
      {networks.map((network) => (
        <NetworkTreeNode
          key={network.id}
          network={network}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
