'use client';

import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { OrganigramaNode } from './OrganigramaNode';

const nodeTypes = { orgNode: OrganigramaNode };

interface OrganigramaGraphProps {
  initialNodes: Node[];
  initialEdges: Edge[];
}

export function OrganigramaGraph({ initialNodes, initialEdges }: OrganigramaGraphProps) {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  const toggleNode = useCallback((nodeId: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // Compute hidden nodes (descendants of collapsed nodes)
  const hiddenNodeIds = useMemo(() => {
    const hidden = new Set<string>();
    const childrenMap = new Map<string, string[]>();

    // Build parent -> children map from edges
    for (const edge of initialEdges) {
      const children = childrenMap.get(edge.source) ?? [];
      children.push(edge.target);
      childrenMap.set(edge.source, children);
    }

    // BFS from each collapsed node to hide descendants
    for (const collapsedId of collapsedNodes) {
      const queue = childrenMap.get(collapsedId) ?? [];
      while (queue.length > 0) {
        const current = queue.shift()!;
        hidden.add(current);
        const children = childrenMap.get(current) ?? [];
        queue.push(...children);
      }
    }

    return hidden;
  }, [collapsedNodes, initialEdges]);

  const visibleNodes = useMemo(
    () => initialNodes.filter((n) => !hiddenNodeIds.has(n.id)),
    [initialNodes, hiddenNodeIds],
  );

  const visibleEdges = useMemo(() => {
    const visibleIds = new Set(visibleNodes.map((n) => n.id));
    return initialEdges.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target));
  }, [initialEdges, visibleNodes]);

  const [nodes, , onNodesChange] = useNodesState(visibleNodes);
  const [edges, , onEdgesChange] = useEdgesState(visibleEdges);

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      toggleNode(node.id);
    },
    [toggleNode],
  );

  return (
    <div className="h-[600px] w-full rounded-md border bg-background">
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
