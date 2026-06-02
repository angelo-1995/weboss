'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Network,
  GitBranch,
  FileText,
  BarChart3,
  Shield,
  GitMerge,
  Workflow,
  ShieldCheck,
  BookOpen,
  Mic2,
  Mail,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@community-os/ui';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { UserMenu } from '@/components/layout/user-menu';
import { BadgeCount } from '@/components/feedback/badge-count';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
  badge?: number;
  shortcut?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'PRINCIPAL',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'G D' },
      { href: '/pipeline', label: 'Pipeline', icon: Workflow, roles: ['LEADER', 'ADMIN', 'SUPER_ADMIN'], shortcut: 'G P' },
    ],
  },
  {
    label: 'PERSONAS',
    items: [
      { href: '/users', label: 'Acceso al Sistema', icon: Users, roles: ['ADMIN', 'SUPER_ADMIN'], shortcut: 'G U' },
      { href: '/personas', label: 'Personas', icon: Users, shortcut: 'G E' },
      { href: '/groups', label: 'Equipos', icon: Network, shortcut: 'G G' },
      { href: '/discipleship', label: 'Discipulado', icon: GitBranch, shortcut: 'G S' },
    ],
  },
  {
    label: 'ORGANIZACIÓN',
    items: [
      { href: '/organigrama', label: 'Organigrama', icon: GitMerge, roles: ['LEADER', 'ADMIN', 'SUPER_ADMIN'] },
      { href: '/cobertura', label: 'Cobertura', icon: ShieldCheck, roles: ['LEADER', 'ADMIN', 'SUPER_ADMIN'] },
      { href: '/networks', label: 'Redes', icon: Network, roles: ['ADMIN', 'SUPER_ADMIN'] },
      { href: '/sermons', label: 'Predicaciones', icon: BookOpen, shortcut: 'G R' },
      { href: '/sermons/admin', label: 'Gestión Predicaciones', icon: Mic2, roles: ['ADMIN', 'SUPER_ADMIN'] },
      { href: '/reports', label: 'Reportes', icon: FileText, badge: 0 },
    ],
  },
  {
    label: 'SISTEMA',
    items: [
      { href: '/invitations', label: 'Invitaciones', icon: Mail, roles: ['ADMIN', 'SUPER_ADMIN'] },
      { href: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['ADMIN', 'SUPER_ADMIN'] },
      { href: '/audit', label: 'Auditoría', icon: Shield, roles: ['ADMIN', 'SUPER_ADMIN'] },
      { href: '/settings', label: 'Configuración', icon: Settings, shortcut: 'G C' },
    ],
  },
];

/**
 * Shared navigation content used by both desktop SideNav and MobileSidebar.
 */
export function SideNavContent() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const userRoles = user?.roles || [];

  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (!item.roles) return true;
      return item.roles.some((role) => userRoles.includes(role));
    }),
  })).filter((section) => section.items.length > 0);

  return (
    <>
      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3">
        {visibleSections.map((section, idx) => (
          <div key={section.label} className={cn(idx > 0 && 'mt-5')}>
            <p className="uppercase text-[10px] tracking-wider text-muted-foreground font-medium px-3 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href as any}
                    className={cn(
                      'group flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-all duration-150 relative',
                      active
                        ? 'bg-primary/5 text-foreground font-medium border-l-2 border-primary -ml-px'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors duration-150',
                        active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <BadgeCount count={item.badge} className="relative top-0 right-0 ml-auto" />
                    )}
                    {item.shortcut && (
                      <span className="hidden group-hover:inline-flex text-[10px] text-muted-foreground/70 font-mono">
                        {item.shortcut}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Menu Footer */}
      <div className="border-t border-border/50 p-2">
        <UserMenu />
      </div>
    </>
  );
}

/**
 * Desktop sidebar — hidden on mobile, visible on md+.
 */
export function SideNav() {
  return (
    <aside className="hidden md:flex w-[var(--sidebar-width)] shrink-0 border-r border-border/50 bg-card flex-col">
      {/* Logo — J-PDVE Conexiones */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-border/50">
        <div className="h-7 w-7 rounded-lg bg-[#1565FF] flex items-center justify-center">
          <span className="text-white text-[10px] font-bold tracking-tight">JP</span>
        </div>
        <div className="flex flex-col">
          <span className="font-heading text-sm tracking-tight leading-none">J-PDVE</span>
          <span className="text-[10px] text-muted-foreground leading-none mt-0.5">Conexiones</span>
        </div>
      </div>

      <SideNavContent />
    </aside>
  );
}
