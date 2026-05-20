'use client';

import { cn } from '@community-os/ui';
import type { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function GlowCard({ children, className, glow = false }: GlowCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/50 bg-card p-6 transition-all duration-200',
        glow &&
          'shadow-[0_0_20px_-5px_hsl(var(--primary)/0.15)] border-primary/20',
        'hover:shadow-md hover:border-border/80',
        className,
      )}
    >
      {children}
    </div>
  );
}
