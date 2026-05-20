'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { api } from '@/lib/api-client';

interface CoberturaNode {
  id: string;
  name: string;
  spouseName: string | null;
  leaderCode: string | null;
  networkName: string | null;
  subordinateCount: number;
  children: CoberturaNode[];
}

// Color palette for networks
const NETWORK_COLORS: Record<string, string> = {};
const COLOR_PALETTE = [
  'border-blue-500',
  'border-emerald-500',
  'border-purple-500',
  'border-orange-500',
  'border-pink-500',
  'border-cyan-500',
  'border-amber-500',
  'border-rose-500',
];
let colorIndex = 0;

function getNetworkColor(networkName: string | null): string {
  if (!networkName) return 'border-gray-300';
  if (!NETWORK_COLORS[networkName]) {
    NETWORK_COLORS[networkName] = COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];
    colorIndex++;
  }
  return NETWORK_COLORS[networkName];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function TreeNode({ node, depth = 0 }: { node: CoberturaNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const borderColor = getNetworkColor(node.networkName);

  return (
    <div className={depth > 0 ? 'ml-4 sm:ml-6' : ''}>
      {/* Connector line */}
      {depth > 0 && (
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border -ml-4 sm:-ml-6" />
          <div className="absolute left-0 top-4 w-3 sm:w-5 h-px bg-border -ml-4 sm:-ml-6" />
        </div>
      )}

      {/* Node card */}
      <div className={`flex items-start gap-2 py-1.5`}>
        {/* Expand/collapse button */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1.5 p-0.5 rounded hover:bg-muted transition-colors shrink-0"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-5 shrink-0" />
        )}

        {/* Card */}
        <div className={`flex items-center gap-3 rounded-lg border-l-4 ${borderColor} bg-card border border-border px-3 py-2 shadow-sm flex-1 min-w-0`}>
          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-primary">
              {getInitials(node.name)}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm truncate">
                {node.name}
                {node.spouseName && (
                  <span className="text-muted-foreground"> + {node.spouseName}</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              {node.leaderCode && (
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0 text-[10px] font-mono text-blue-700 dark:text-blue-300">
                  {node.leaderCode}
                </span>
              )}
              {node.networkName && (
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0 text-[10px] text-muted-foreground">
                  {node.networkName}
                </span>
              )}
              {node.subordinateCount > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {node.subordinateCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="relative">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CoberturaPage() {
  const [tree, setTree] = useState<CoberturaNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await api.get<CoberturaNode[]>('/users/cobertura');
        setTree(data);
      } catch {
        setTree([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cobertura" description="Árbol de cobertura pastoral" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cobertura"
        description="Árbol jerárquico de cobertura pastoral — parejas se muestran juntas"
      />

      {tree.length === 0 ? (
        <p className="text-sm text-muted-foreground">No se encontraron relaciones de cobertura.</p>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[400px] space-y-1">
            {tree.map((node) => (
              <TreeNode key={node.id} node={node} depth={0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
