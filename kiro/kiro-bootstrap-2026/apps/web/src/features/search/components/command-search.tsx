'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch, type SearchResult } from '../hooks/use-search';
import { cn } from '@community-os/ui';

const TYPE_ICON: Record<string, string> = {
  users: '👤',
  groups: '◎',
  discipleship: '⬡',
};

const TYPE_HREF: Record<string, (id: string) => string> = {
  users: (id) => `/users/${id}`,
  groups: (id) => `/groups/${id}`,
  discipleship: (id) => `/discipleship/${id}`,
};

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { data: results = [], isFetching } = useSearch(query);

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery('');
  }, [open]);

  const handleSelect = (result: SearchResult) => {
    const href = TYPE_HREF[result.type]?.(result.id);
    if (href) router.push(href as any);
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-muted/50 text-sm text-muted-foreground hover:bg-muted transition-colors w-48"
      >
        <span>🔍</span>
        <span className="flex-1 text-left">Buscar...</span>
        <kbd className="text-xs bg-background border border-border rounded px-1">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <span className="text-muted-foreground">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar usuarios, grupos, discipulado..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {isFetching && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto py-2">
            {results.map((result) => (
              <li key={`${result.type}-${result.id}`}>
                <button
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition-colors"
                >
                  <span className="text-base">{TYPE_ICON[result.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    )}
                  </div>
                  <span className={cn(
                    'shrink-0 text-xs rounded-full px-2 py-0.5',
                    result.type === 'users' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                    result.type === 'groups' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                    result.type === 'discipleship' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                  )}>
                    {result.type}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {query.length >= 2 && results.length === 0 && !isFetching && (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">
            Sin resultados para &ldquo;{query}&rdquo;
          </p>
        )}

        {query.length < 2 && (
          <p className="px-4 py-4 text-xs text-muted-foreground text-center">
            Escribe al menos 2 caracteres para buscar
          </p>
        )}
      </div>
    </div>
  );
}
