'use client';

import { useEffect } from 'react';
import { DefaultErrorFallback } from '@/components/error/error-fallback';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <DefaultErrorFallback error={error} onReset={reset} />
    </div>
  );
}
