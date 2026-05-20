'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@community-os/ui';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({ children, className, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={cn('rounded-lg border border-border/50 bg-card', className)}
    >
      {children}
    </motion.div>
  );
}
