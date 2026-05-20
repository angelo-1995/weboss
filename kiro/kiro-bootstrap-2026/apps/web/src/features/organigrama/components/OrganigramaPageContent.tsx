'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { organigramaService } from '@/features/organigrama/services/organigrama.service';
import { transformToReactFlow, buildNetworkColorMap } from '@/features/organigrama/utils/transform-organigrama';
import { OrganigramaGraph } from '@/features/organigrama/components/OrganigramaGraph';
import { OrganigramaLegend } from '@/features/organigrama/components/OrganigramaLegend';
import type { Node, Edge } from 'reactflow';
import type { NetworkTreeNode } from '@/features/organigrama/services/organigrama.service';

export function OrganigramaPageContent() {
  const { accessToken } = useAuthStore();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [networks, setNetworks] = useState<NetworkTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) return;

    async function fetchData() {
      try {
        const [orgData, networksData] = await Promise.all([
          organigramaService.getOrganigrama(accessToken!),
          organigramaService.getNetworks(accessToken!),
        ]);

        setNetworks(networksData);
        const { nodes: n, edges: e } = transformToReactFlow(orgData, networksData);
        setNodes(n);
        setEdges(e);
      } catch (err: any) {
        setError(err.message ?? 'Error al cargar el organigrama');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [accessToken]);

  const colorMap = buildNetworkColorMap(networks);
  const legendItems = networks.map((n) => ({
    name: n.name,
    color: colorMap[n.id] ?? '#6b7280',
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organigrama"
        description="Estructura de cobertura pastoral"
      />

      {loading && (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando organigrama...</p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {nodes.length === 0 ? (
            <div className="flex items-center justify-center h-64 rounded-md border bg-muted/30">
              <p className="text-muted-foreground">
                No hay relaciones de cobertura registradas.
              </p>
            </div>
          ) : (
            <>
              <OrganigramaLegend items={legendItems} />
              <OrganigramaGraph initialNodes={nodes} initialEdges={edges} />
            </>
          )}
        </>
      )}
    </div>
  );
}
