import { cn } from '@community-os/ui';

interface BadgeCountProps {
  count: number;
  className?: string;
}

export function BadgeCount({ count, className }: BadgeCountProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        'absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground',
        className,
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
