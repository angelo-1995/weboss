'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

interface OrgNodeData {
  fullName: string;
  role: string;
  networkName: string | null;
  phone: string | null;
  leaderCode: string | null;
  color: string;
}

function OrganigramaNodeComponent({ data }: NodeProps<OrgNodeData>) {
  const initials = data.fullName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const roleBadge: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    LEADER: 'Líder',
    MEMBER: 'Miembro',
    GUEST: 'Invitado',
  };

  return (
    <div
      className="rounded-lg border-2 bg-card px-3 py-2 shadow-sm min-w-[180px]"
      style={{ borderColor: data.color }}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: data.color }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{data.fullName}</p>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {roleBadge[data.role] ?? data.role}
            </span>
            {data.leaderCode && (
              <span className="inline-block rounded bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 text-[10px] font-mono text-amber-700 dark:text-amber-300">
                {data.leaderCode}
              </span>
            )}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
    </div>
  );
}

export const OrganigramaNode = memo(OrganigramaNodeComponent);
