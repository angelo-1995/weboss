'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { TreeView } from '@/components/hierarchy/tree-view';
import { CreateRelationshipModal } from '@/features/discipleship/components/create-relationship-modal';
import { useDiscipleTree, useRelationships } from '@/features/discipleship/hooks/use-discipleship';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { RelationshipsList } from '@/features/discipleship/components/relationships-list';

export default function DiscipleshipPage() {
  const [createOpen, setCreateOpen] = React.useState(false);
  const { user } = useAuthStore();
  const { data: treeData, isLoading: treeLoading } = useDiscipleTree(user?.id || '');
  const { data: relationships, isLoading: relLoading } = useRelationships();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discipulado"
        description="Relaciones de mentoría y seguimiento organizacional"
      >
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nueva Relación
        </Button>
      </PageHeader>

      {/* Relationships list */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-medium mb-4">Relaciones activas</h2>
        <RelationshipsList
          relationships={relationships?.data || []}
          isLoading={relLoading}
        />
      </div>

      {/* Tree visualization */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-medium mb-4">Árbol de discipulado</h2>
        {treeLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-muted rounded animate-pulse w-32" />
                  <div className="h-2.5 bg-muted rounded animate-pulse w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <TreeView
            data={treeData || []}
            emptyMessage="No hay discípulos activos en tu árbol"
          />
        )}
      </div>

      <CreateRelationshipModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
