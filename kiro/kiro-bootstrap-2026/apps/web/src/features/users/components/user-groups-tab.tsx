'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface GroupMembership {
  id: string;
  group: {
    id: string;
    name: string;
    type?: string;
  };
  role: string;
}

interface UserGroupsTabProps {
  user: {
    id: string;
    groupMemberships?: GroupMembership[];
  };
}

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  LEADER: 'default',
  CO_LEADER: 'secondary',
  MEMBER: 'outline',
  GUEST: 'outline',
};

export function UserGroupsTab({ user }: UserGroupsTabProps) {
  const memberships = user.groupMemberships ?? [];

  if (memberships.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          Este usuario no pertenece a ningún grupo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {memberships.map((membership) => (
        <Link
          key={membership.id}
          href={`/groups/${membership.group.id}`}
          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <div>
            <p className="text-sm font-medium">{membership.group.name}</p>
            {membership.group.type && (
              <p className="text-xs text-muted-foreground">{membership.group.type}</p>
            )}
          </div>
          <Badge variant={roleBadgeVariant[membership.role] ?? 'outline'}>
            {membership.role}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
