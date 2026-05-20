'use client';

import { useDiscipleTree } from '../hooks/use-discipleship';

interface TreeNode {
  id: string;
  disciple: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
  };
  startDate: string;
  children: TreeNode[];
}

function TreeNodeCard({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const { disciple, children, startDate } = node;
  const hasChildren = children.length > 0;

  return (
    <div className="relative">
      {/* Connector line */}
      {depth > 0 && (
        <div className="absolute -left-4 top-4 w-4 h-px bg-border" />
      )}

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border border-border">
          {disciple.firstName[0]}{disciple.lastName[0]}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight">
            {disciple.firstName} {disciple.lastName}
          </p>
          <p className="text-xs text-muted-foreground truncate">{disciple.email}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            desde {new Date(startDate).toLocaleDateString('es', { month: 'short', year: 'numeric' })}
          </p>
        </div>

        {hasChildren && (
          <span className="shrink-0 text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {children.length}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && (
        <div className="ml-4 mt-2 pl-4 border-l border-border space-y-3">
          {children.map((child) => (
            <TreeNodeCard key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function DiscipleTree({ mentorId }: { mentorId: string }) {
  const { data, isLoading, isError } = useDiscipleTree(mentorId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 bg-muted rounded animate-pulse w-32" />
              <div className="h-2.5 bg-muted rounded animate-pulse w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-destructive">Error al cargar el árbol</p>;
  }

  const tree = (data ?? []) as TreeNode[];

  if (!tree.length) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No hay discípulos activos
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {tree.map((node) => (
        <TreeNodeCard key={node.id} node={node} />
      ))}
    </div>
  );
}
