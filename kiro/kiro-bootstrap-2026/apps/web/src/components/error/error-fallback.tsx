'use client';

import Link from 'next/link';

interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
}

export function DefaultErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-semibold text-foreground">
        Algo salió mal
      </h2>

      <p className="max-w-md text-muted-foreground">
        Ha ocurrido un error inesperado. Por favor, intenta de nuevo o vuelve al
        inicio.
      </p>

      {isDev && error && (
        <pre className="mt-2 max-w-lg overflow-auto rounded-md bg-muted p-4 text-left text-sm text-muted-foreground">
          {error.message}
        </pre>
      )}

      <div className="mt-4 flex gap-3">
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Reintentar
          </button>
        )}
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
