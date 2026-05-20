'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api-client';
import { cn } from '@community-os/ui';

interface UserResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface UserSearchInputProps {
  onSelect: (user: UserResult) => void;
  placeholder?: string;
  multiple?: boolean;
  selectedUsers?: UserResult[];
  onRemove?: (userId: string) => void;
}

export function UserSearchInput({
  onSelect,
  placeholder = 'Buscar usuario...',
  multiple = false,
  selectedUsers = [],
  onRemove,
}: UserSearchInputProps) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<UserResult[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await api.get<any>('/search', {
          q: query,
          type: 'users',
          limit: 10,
        });
        // The search endpoint returns either:
        // - Array of { id, type, title, subtitle } (from /search)
        // - Or { data: [...] } format
        const rawResults = Array.isArray(data) ? data : (data.data || data.value || []);
        
        // Map search results to UserResult format
        const mapped: UserResult[] = rawResults.map((r: any) => {
          if (r.firstName) return r; // Already in correct format
          // Parse from search result format: title = "FirstName LastName", subtitle = email
          const parts = (r.title || '').split(' ');
          return {
            id: r.id,
            firstName: parts[0] || '',
            lastName: parts.slice(1).join(' ') || '',
            email: r.subtitle || r.email || '',
          };
        });
        
        setResults(mapped);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (user: UserResult) => {
    onSelect(user);
    if (!multiple) {
      setQuery(`${user.firstName} ${user.lastName}`);
      setIsOpen(false);
    } else {
      setQuery('');
    }
  };

  const selectedIds = new Set(selectedUsers.map((u) => u.id));

  return (
    <div ref={containerRef} className="relative">
      {multiple && selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedUsers.map((user) => (
            <span
              key={user.id}
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs"
            >
              {user.firstName} {user.lastName}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(user.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="pl-8"
        />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-muted-foreground text-center">Buscando...</div>
          ) : results.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground text-center">Sin resultados</div>
          ) : (
            results.map((user) => (
              <button
                key={user.id}
                type="button"
                disabled={selectedIds.has(user.id)}
                className={cn(
                  'w-full flex flex-col items-start px-3 py-2 text-sm hover:bg-accent transition-colors text-left',
                  selectedIds.has(user.id) && 'opacity-50 cursor-not-allowed',
                )}
                onClick={() => handleSelect(user)}
              >
                <span className="font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
