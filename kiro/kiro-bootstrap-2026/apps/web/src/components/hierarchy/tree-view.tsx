'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';
import { cn } from '@community-os/ui';

export interface TreeNodeData {
  id: string;
  type: string;
  disciple: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
  };
  startDate: string;
  discipleCount: number;
  children: TreeNodeData[];
}

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  MENTOR_MENTEE: { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  LEADER_MEMBER: { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  ACCOUNTABILITY: { bg: 'bg-orange-50 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  PASTORAL: { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
};

const TYPE_LABELS: Record<string, string> = {
  MENTOR_MENTEE: 'Mentor',
  LEADER_MEMBER: 'Líder',
  ACCOUNTABILITY: 'Accountability',
  PASTORAL: 'Pastoral',
};

const TYPE_LINE_COLORS: Record<string, string> = {
  MENTOR_MENTEE: 'border-blue-300 dark:border-blue-700',
  LEADER_MEMBER: 'border-purple-300 dark:border-purple-700',
  ACCOUNTABILITY: 'border-orange-300 dark:border-orange-700',
  PASTORAL: 'border-green-300 dark:border-green-700',
};

function TreeNode({ node, depth = 0 }: { node: TreeNodeData; depth?: number }) {
  const [expanded, setExpanded] = React.useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const colors = TYPE_COLORS[node.type] || TYPE_COLORS.MENTOR_MENTEE;
  const lineColor = TYPE_LINE_COLORS[node.type] || 'border-border';

  const initials = `${node.disciple.firstName[0] || ''}${node.disciple.lastName[0] || ''}`.toUpperCase();

  return (
    <div className="relative">
      {/* Horizontal connector line */}
      {depth > 0 && (
        <div className="absolute -left-5 top-5 w-5 h-px border-t border-dashed border-border" />
      )}

      {/* Node card */}
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border p-3 transition-colors',
          colors.border,
          hasChildren ? 'cursor-pointer hover:bg-accent/50' : '',
        )}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Expand/collapse icon */}
        <div className="shrink-0 w-5">
          {hasChildren && (
            expanded
              ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
              : <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Avatar */}
        <div className={cn(
          'shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold',
          colors.bg, colors.text,
        )}>
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight truncate">
            {node.disciple.firstName} {node.disciple.lastName}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn('text-xs px-1.5 py-0.5 rounded-full', colors.bg, colors.text)}>
              {TYPE_LABELS[node.type] || node.type}
            </span>
          </div>
        </div>

        {/* Disciple count badge */}
        {node.discipleCount > 0 && (
          <div className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            <Users className="h-3 w-3" />
            {node.discipleCount}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className={cn('ml-7 mt-2 pl-5 border-l border-dashed space-y-2', lineColor)}>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

interface TreeViewProps {
  data: TreeNodeData[];
  emptyMessage?: string;
}

export function TreeView({ data, emptyMessage = 'No hay datos para mostrar' }: TreeViewProps) {
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((node) => (
        <TreeNode key={node.id} node={node} depth={0} />
      ))}
    </div>
  );
}
