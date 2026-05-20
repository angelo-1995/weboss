'use client';

import * as React from 'react';
import { cn } from '@community-os/ui';

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextValue>({
  open: false,
  setOpen: () => {},
});

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) setOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative" data-dropdown>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

function DropdownMenuTrigger({ children, className, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = React.useContext(DropdownContext);
  return (
    <button
      className={cn('outline-none', className)}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownMenuContent({ className, children, align = 'end', ...props }: React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'end' }) {
  const { open } = React.useContext(DropdownContext);
  if (!open) return null;

  return (
    <div
      className={cn(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
        align === 'end' ? 'right-0' : 'left-0',
        'bottom-full mb-1',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { setOpen } = React.useContext(DropdownContext);
  return (
    <div
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
        className,
      )}
      onClick={(e) => {
        props.onClick?.(e);
        setOpen(false);
      }}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />;
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator };
