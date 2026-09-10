"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Background, Controls, Handle, Position, ReactFlow, type Node, type NodeProps, type NodeChange } from "@xyflow/react";
import { cn } from "@/lib/kernel";
import "@xyflow/react/dist/style.css";
import s from "./canvas.module.css";

export type CanvasNode = { id: string; label: string; position: { x: number; y: number }; content: ReactNode };
export type CanvasEdge = { id: string; source: string; target: string; label?: string };
export type CanvasProps = {
  label: string;
  nodes: readonly CanvasNode[];
  edges?: readonly CanvasEdge[];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  /** Controlled positions, including keyboard moves. Persist at the caller's save boundary. */
  onPositionsChange?: (positions: ReadonlyMap<string, { x: number; y: number }>) => void;
  empty?: ReactNode;
  className?: string;
};
type FlowNode = Node<{ content: ReactNode }, "content">;
function ContentNode({ data }: NodeProps<FlowNode>) {
  return <div className={s.node}>
    <Handle type="target" position={Position.Left} className={s.handle} />
    {data.content}
    <Handle type="source" position={Position.Right} className={s.handle} />
  </div>;
}
const nodeTypes = { content: ContentNode };

export function Canvas({ label, nodes, edges = [], selectedId, onSelect, onPositionsChange, empty = "No items on this canvas.", className }: CanvasProps) {
  // Measurements belong to the renderer, not to the caller's persisted model.
  // Controlled nodes must carry them back into the engine; otherwise a new
  // content/position prop discards handle bounds and connections disappear.
  const [measurements, setMeasurements] = useState(() => new Map<string, { width: number; height: number }>());
  const flowNodes = useMemo<FlowNode[]>(() => nodes.map(node => ({
    id: node.id, type: "content", position: node.position, data: { content: node.content },
    measured: measurements.get(node.id),
    ariaLabel: node.label, selected: node.id === selectedId, style: { width: 220 },
  })), [nodes, selectedId, measurements]);
  const flowEdges = useMemo(() => {
    const ids = new Set(nodes.map(node => node.id));
    return edges.filter(edge => ids.has(edge.source) && ids.has(edge.target)).map(edge => ({ ...edge, type: "smoothstep" }));
  }, [edges, nodes]);
  function change(changes: NodeChange<FlowNode>[]) {
    if (changes.some(change => change.type === "dimensions" && change.dimensions)) {
      setMeasurements(previous => {
        const next = new Map(nodes.filter(node => previous.has(node.id)).map(node => [node.id, previous.get(node.id)!]));
        let changed = next.size !== previous.size;
        for (const change of changes) {
          if (change.type === "dimensions" && change.dimensions
            && (next.get(change.id)?.width !== change.dimensions.width || next.get(change.id)?.height !== change.dimensions.height)) {
            next.set(change.id, change.dimensions);
            changed = true;
          }
        }
        return changed ? next : previous;
      });
    }
    const positions = new Map<string, { x: number; y: number }>();
    const selection = changes.findLast(change => change.type === "select" && change.selected);
    if (selection?.type === "select") onSelect?.(selection.id);
    else if (changes.some(change => change.type === "select" && !change.selected && change.id === selectedId)) onSelect?.(null);
    for (const change of changes) {
      if (change.type === "position" && change.position) positions.set(change.id, change.position);
    }
    if (positions.size) onPositionsChange?.(positions);
  }
  return <div className={cn(s.canvas, className)} role="region" aria-label={label}>
    {nodes.length ? <ReactFlow<FlowNode>
      aria-label={label}
      nodes={flowNodes} edges={flowEdges} nodeTypes={nodeTypes}
      onNodesChange={change} onPaneClick={() => onSelect?.(null)}
      nodesDraggable={Boolean(onPositionsChange)} nodesConnectable={false}
      elementsSelectable={Boolean(onSelect)} nodesFocusable edgesFocusable
      deleteKeyCode={null} multiSelectionKeyCode={null}
      fitView fitViewOptions={{ padding: 0.25 }} minZoom={0.25} maxZoom={2}
      ariaLabelConfig={{ "node.a11yDescription.default": onPositionsChange ? "Press Enter to select this item. Use the arrow keys to move it. Press Escape to clear selection." : "Press Enter to select this item. Press Escape to clear selection." }}
    >
      <Background color="var(--line-heavy)" gap={20} />
      <Controls showInteractive={false} />
    </ReactFlow> : <div className={s.empty}>{empty}</div>}
  </div>;
}
