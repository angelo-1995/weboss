'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { cn } from '@community-os/ui';
import { useSidebarStore } from './stores/sidebar.store';
import { SideNavContent } from './side-nav';

/**
 * Mobile sidebar with overlay backdrop. Hidden on md+ screens.
 * Closes automatically on route change.
 */
export function MobileSidebar() {
  const { isOpen, close } = useSidebarStore();
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] bg-card border-r border-border/50 flex flex-col transform transition-transform duration-200 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header with close button */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">C</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">Community OS</span>
          </div>
          <button
            onClick={close}
            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav content — same as desktop */}
        <SideNavContent />
      </aside>
    </>
  );
}
