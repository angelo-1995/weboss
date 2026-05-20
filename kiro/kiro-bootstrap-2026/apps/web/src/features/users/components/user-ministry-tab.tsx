'use client';

import { Badge } from '@/components/ui/badge';

interface UserMinistryTabProps {
  user: {
    id: string;
    roles: string[];
    campus?: { id: string; name: string } | null;
    profile?: {
      ministries?: string[] | null;
    } | null;
  };
}

export function UserMinistryTab({ user }: UserMinistryTabProps) {
  return (
    <div className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Campus</h3>
        <p className="text-sm">{user.campus?.name ?? 'Sin asignar'}</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Roles</h3>
        <div className="flex flex-wrap gap-2">
          {user.roles.map((role) => (
            <Badge key={role} variant="secondary">
              {role}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Ministerios</h3>
        {user.profile?.ministries && user.profile.ministries.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.profile.ministries.map((ministry) => (
              <Badge key={ministry} variant="outline">
                {ministry}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin ministerios asignados</p>
        )}
      </div>
    </div>
  );
}
