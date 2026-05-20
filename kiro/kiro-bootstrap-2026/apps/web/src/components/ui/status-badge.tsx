import { cn } from '@community-os/ui';
import { statusColors } from '@/lib/design-tokens';

type StatusVariant = keyof typeof statusColors;

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border',
        statusColors[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
