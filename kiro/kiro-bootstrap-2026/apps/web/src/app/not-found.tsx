import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-muted p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h1 className="text-4xl font-bold text-foreground">404</h1>

      <h2 className="text-xl font-semibold text-foreground">
        Página no encontrada
      </h2>

      <p className="max-w-md text-muted-foreground">
        La página que buscas no existe o ha sido movida.
      </p>

      <Link
        href="/dashboard"
        className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
