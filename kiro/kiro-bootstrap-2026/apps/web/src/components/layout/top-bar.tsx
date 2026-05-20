'use client';

import { usePathname } from 'next/navigation';
import { Sun, Moon, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CommandSearch } from '@/features/search/components/command-search';
import { NotificationDropdown } from '@/features/notifications/components/notification-dropdown';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useSidebarStore } from '@/components/layout/stores/sidebar.store';
import { cn } from '@community-os/ui';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pipeline': 'Pipeline',
  '/users': 'Usuarios',
  '/groups': 'Grupos',
  '/discipleship': 'Discipulado',
  '/organigrama': 'Organigrama',
  '/cobertura': 'Cobertura',
  '/sermons': 'Predicaciones',
  '/reports': 'Informes',
  '/analytics': 'Analytics',
  '/audit': 'Auditoría',
  '/notifications': 'Notificaciones',
};

function getPageLabel(pathname: string): string {
  // Exact match
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  // Prefix match (e.g. /users/123)
  const base = '/' + pathname.split('/').filter(Boolean)[0];
  return ROUTE_LABELS[base] || 'Dashboard';
}

function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.charAt(0) || '';
  const l = lastName?.charAt(0) || '';
  return (f + l).toUpperCase() || '?';
}

export function TopBar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const toggle = useSidebarStore((s) => s.toggle);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      setIsDark(false);
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.add('dark');
      setIsDark(true);
      localStorage.setItem('theme', 'dark');
    }
  };

  const pageLabel = getPageLabel(pathname);
  const initials = user ? getInitials(user.firstName, user.lastName) : '?';

  return (
    <header className="h-14 border-b border-border/50 bg-card/80 backdrop-blur-sm flex items-center px-4 sm:px-6 shrink-0 sticky top-0 z-30">
      {/* Left: Hamburger (mobile) + Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={toggle}
          className="md:hidden h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-foreground truncate">{pageLabel}</span>
      </div>

      {/* Center: Search (hidden on very small screens) */}
      <div className="flex-1 hidden sm:flex justify-center px-4">
        <CommandSearch />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-150"
          aria-label="Cambiar tema"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User avatar */}
        {user && (
          <a
            href={`/users/${user.id}`}
            className={cn(
              'ml-2 h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-semibold',
              'hover:ring-2 hover:ring-primary/20 transition-all duration-150',
            )}
          >
            {initials}
          </a>
        )}
      </div>
    </header>
  );
}
