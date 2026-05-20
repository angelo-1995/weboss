'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useSermonFiltersStore } from '../stores/sermon-filters.store';

export function SermonFilterBar() {
  const { search, dateFrom, dateTo, setSearch, setDateFrom, setDateTo, clearFilters } =
    useSermonFiltersStore();
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearch]);

  // Sync external search changes
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const hasFilters = search || dateFrom || dateTo;

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search input */}
      <div className="relative flex-1 w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar predicaciones..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        />
      </div>

      {/* Date range */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <label htmlFor="date-from" className="text-xs text-muted-foreground whitespace-nowrap">
            Desde
          </label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 px-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <label htmlFor="date-to" className="text-xs text-muted-foreground whitespace-nowrap">
            Hasta
          </label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 px-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-1 h-9 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Limpiar
        </button>
      )}
    </div>
  );
}
