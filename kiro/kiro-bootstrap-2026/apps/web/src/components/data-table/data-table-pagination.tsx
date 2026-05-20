'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataTablePaginationProps {
  hasMore: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function DataTablePagination({ hasMore, hasPrev, onNext, onPrev }: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-end gap-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={!hasPrev}
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!hasMore}
      >
        Siguiente
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
