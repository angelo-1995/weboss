'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export function ExportButton() {
  const [open, setOpen] = useState(false);
  const { accessToken } = useAuthStore();

  const handleCSV = async () => {
    setOpen(false);
    try {
      const res = await fetch(`${BASE_URL}/reports/cell/export?format=csv`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Error al exportar');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reportes-celula.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export CSV error:', err);
    }
  };

  const handlePDF = () => {
    setOpen(false);
    window.print();
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        type="button"
      >
        Exportar ▾
      </Button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-36 rounded-md border bg-popover shadow-md">
          <button
            onClick={handleCSV}
            className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
          >
            📄 CSV
          </button>
          <button
            onClick={handlePDF}
            className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
          >
            🖨️ PDF (Imprimir)
          </button>
        </div>
      )}
    </div>
  );
}
