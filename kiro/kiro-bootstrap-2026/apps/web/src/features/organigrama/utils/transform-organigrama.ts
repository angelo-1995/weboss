import dagre from 'dagre';
import type { Node, Edge } from 'reactflow';
import type { OrganigramaResponse, NetworkTreeNode } from '../services/organigrama.service';

const NETWORK_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
];

export function buildNetworkColorMap(networks: NetworkTreeNode[]): Record<string, string> {
  const colorMap: Record<string, string> = {};
  const flatNetworks = flattenNetworks(networks);
  flatNetworks.forEach((n, i) => {
    colorMap[n.id] = NETWORK_COLORS[i % NETWORK_COLORS.length];
  });
  return colorMap;
}

function flattenNetworks(networks: NetworkTreeNode[]): NetworkTreeNode[] {
  const result: NetworkTreeNode[] = [];
  for (const n of networks) {
    result.push(n);
    if (n.children.length > 0) {
      result.push(...flattenNetworks(n.children));
    }
  }
  return result;
}

export function transformToReactFlow(
  data: OrganigramaResponse,
  networks: NetworkTreeNode[],
): { nodes: Node[]; edges: Edge[] } {
  const colorMap = buildNetworkColorMap(networks);

  const nodes: Node[] = data.nodes.map((n) => ({
    id: n.id,
    type: 'orgNode',
    data: {
      ...n,
      color: colorMap[n.networkId ?? ''] ?? '#6b7280',
    },
    position: { x: 0, y: 0 },
  }));

  const edges: Edge[] = data.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
    animated: false,
  }));

  return applyDagreLayout(nodes, edges);
}

function applyDagreLayout(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 120 });

  const nodeWidth = 200;
  const nodeHeight = 80;

  nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
