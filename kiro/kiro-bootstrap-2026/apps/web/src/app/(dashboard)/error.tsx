'use client';

import { useEffect } from 'react';
import { DefaultErrorFallback } from '@/components/error/error-fallback';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return <DefaultErrorFallback error={error} onReset={reset} />;
}
