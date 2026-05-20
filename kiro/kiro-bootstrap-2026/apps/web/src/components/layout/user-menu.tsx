'use client';

import { User, Shield, LogOut } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@community-os/ui';

function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.charAt(0) || '';
  const l = lastName?.charAt(0) || '';
  return (f + l).toUpperCase() || '?';
}

export function UserMenu() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const initials = getInitials(user.firstName, user.lastName);
  const primaryRole = user.roles[0] || 'MEMBER';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left w-full">
          <div
            className={cn(
              'h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0',
            )}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.firstName} {user.lastName}
            </p>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {primaryRole}
            </Badge>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
          <User className="h-4 w-4 mr-2" />
          Mi Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.location.href = '/settings/security'}>
          <Shield className="h-4 w-4 mr-2" />
          Seguridad
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
