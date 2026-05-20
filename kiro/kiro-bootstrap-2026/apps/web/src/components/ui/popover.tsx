'use client';

import * as React from 'react';
import { cn } from '@community-os/ui';

interface PopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Popover({ open, onOpenChange, children }: PopoverProps) {
  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ open?: boolean; onOpenChange?: (open: boolean) => void }>, { open, onOpenChange });
        }
        return child;
      })}
    </div>
  );
}

function PopoverTrigger({ children, open, onOpenChange, ...props }: React.HTMLAttributes<HTMLDivElement> & { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  return (
    <div onClick={() => onOpenChange?.(!open)} {...props}>
      {children}
    </div>
  );
}

function PopoverContent({
  className,
  children,
  open,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  if (!open) return null;

  return (
    <div
      className={cn(
        'absolute top-full left-0 z-50 mt-1 w-full min-w-[200px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Popover, PopoverTrigger, PopoverContent };
