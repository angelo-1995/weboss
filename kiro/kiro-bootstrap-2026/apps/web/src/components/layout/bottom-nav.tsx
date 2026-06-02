'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, BookOpen, User } from 'lucide-react';
import { cn } from '@community-os/ui';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/personas', label: 'Personas', icon: Users },
  { href: '/reports', label: 'Reportes', icon: FileText },
  { href: '/sermons', label: 'Recursos', icon: BookOpen },
  { href: '/profile', label: 'Perfil', icon: User },
];

/**
 * Bottom navigation bar for mobile devices.
 * Visible only on screens < md (768px).
 * Provides 1-tap access to the 5 most important sections.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all duration-150 min-w-[56px]',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'text-primary')} />
              <span className={cn('text-[10px] leading-none', active ? 'font-semibold' : 'font-normal')}>
                {item.label}
              </span>
              {active && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
