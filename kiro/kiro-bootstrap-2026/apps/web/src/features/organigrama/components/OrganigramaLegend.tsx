'use client';

interface LegendItem {
  name: string;
  color: string;
}

interface OrganigramaLegendProps {
  items: LegendItem[];
}

export function OrganigramaLegend({ items }: OrganigramaLegendProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-md border bg-card p-3">
      <h3 className="text-sm font-semibold mb-2">Redes</h3>
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
