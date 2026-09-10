"use client";

import { useMemo, useState, type ReactNode } from "react";
import { px } from "../_kernel/scale";
import {
  circular, columns, concentric, force, grid, tiered,
  type GraphInput, type LayoutName, type Placement, type Point,
} from "../_kernel/layout";
import { cose } from "../_kernel/layout-cose";
import { shapePath, type MarkShape } from "../_kernel/encode";
import s from "./graph-frame.module.css";
import { THead, TBody, Tr, Th, Td } from "@/components/display/table";
import { Button } from "@/components/forms";
import { ChartData } from "../_shared/chart-data";

export type GraphNode = {
  id: string;
  label?: string;
  /** Which tier or class. Drives `tiered` layout and the shape channel. */
  group?: string | number;
  /** Mark radius in pixels. Use radiusFor to encode a numeric value by area. */
  size?: number;
  fill?: string | null;
  shape?: MarkShape;
};

export type GraphEdge = {
  from: string;
  to: string;
  label?: string;
  /** A second edge KIND, drawn differently. Not a weight. */
  kind?: string;
  /** `-1 .. 1`, for a signed network. Drives hue where present. */
  signed?: number;
  width?: number;
};

export type GraphFrameProps = {
  nodes: readonly GraphNode[];
  edges: readonly GraphEdge[];
  width: number;
  height: number;
  layout?: LayoutName;
  /** Required by `concentric`; ignored by every other layout. */
  rootId?: string;
  /** Tier order for `tiered`. Absent means insertion order. */
  groupOrder?: readonly (string | number)[];
  /** Positions a person dragged. A pin wins outright. */
  pins?: ReadonlyMap<string, Point>;
  /** Curve the edges. Straight is right for a radial layout; an arc separates
   *  parallel edges and reads better on a circular one. */
  curved?: boolean;
  labels?: boolean;
  /** Translucent hulls behind groups of nodes — the enrichment-map annotation
   *  layer. Drawn under everything. */
  hulls?: { ids: readonly string[]; label?: string; fill?: string }[];
  onSelect?: (id: string | null) => void;
  selected?: string | null;
  title?: string;
  className?: string;
  children?: ReactNode;
};

const DEFAULT_R = 6;

/** Shared SVG geometry; pointer and selection state do not recompute layout. */
export function GraphFrame({
  nodes,
  edges,
  width,
  height,
  layout = "force",
  rootId,
  groupOrder,
  pins,
  curved = false,
  labels = true,
  hulls,
  onSelect,
  selected,
  title = "Network diagram",
  className,
  children,
}: GraphFrameProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  const placement = useMemo<Placement>(() => {
    const input: GraphInput = { nodes, edges, width, height, pins };
    switch (layout) {
      case "concentric":
        return concentric(input, rootId ?? nodes[0]?.id ?? "");
      case "circular":
        return circular(input);
      case "tiered":
        return tiered(input, groupOrder);
      case "columns":
        return columns(input);
      case "grid":
        return grid(input);
      case "force":
        return force(input);
      case "cose":
      default:
        return cose(input);
    }
  }, [nodes, edges, width, height, pins, layout, rootId, groupOrder]);

  const lit = hovered ?? selected ?? null;

  /** One hop from the lit node. Computed here rather than per-mark so the cost
   *  is one pass over the edges instead of one per node. */
  const near = useMemo(() => {
    if (lit === null) return null;
    const ids = new Set<string>([lit]);
    for (const e of edges) {
      if (e.from === lit) ids.add(e.to);
      if (e.to === lit) ids.add(e.from);
    }
    return ids;
  }, [edges, lit]);

  const markOf = (id: string) =>
    near === null ? undefined : id === lit ? "lit" : near.has(id) ? "near" : "dim";

  // Layout dimensions describe the node field. Give annotations and labels
  // their own margin so the frame does not crop the very groups it names.
  let left = 0, top = 0, right = width, bottom = height;
  for (const node of nodes) {
    const at = placement.get(node.id);
    if (at) { left = Math.min(left, at.x - 40); right = Math.max(right, at.x + 40); top = Math.min(top, at.y - 20); bottom = Math.max(bottom, at.y + 30); }
  }
  for (const hull of hulls ?? []) {
    const points = hull.ids.flatMap((id) => nodeById.has(id) && placement.has(id) ? [placement.get(id)!] : []);
    if (!points.length) continue;
    const cx = points.reduce((sum, point) => sum + point.x, 0) / points.length;
    const cy = points.reduce((sum, point) => sum + point.y, 0) / points.length;
    const radius = Math.max(28, ...points.map((point) => Math.sqrt((point.x - cx) ** 2 + (point.y - cy) ** 2))) + 22;
    left = Math.min(left, cx - radius * 1.15); right = Math.max(right, cx + radius * 1.15);
    top = Math.min(top, cy - radius - 22); bottom = Math.max(bottom, cy + radius);
  }

  return (
    <>
    {nodes.length ? <div className={s.viewport} role="region" aria-label={`${title} plot`} tabIndex={0}>
    <svg
      viewBox={`${px(left)} ${px(top)} ${px(right - left)} ${px(bottom - top)}`}
      width={px(right - left)}
      height={px(bottom - top)}
      className={[s.frame, className].filter(Boolean).join(" ")}
      role={onSelect ? "group" : "img"}
      aria-label={title}
      data-lit={lit ? "" : undefined}
    >
      {title ? <title>{title}</title> : null}

      {/* Hulls first — an annotation layer behind the graph, never on top of a
          label. This is the enrichment map's shading and it is the one thing in
          the catalogue that is drawn rather than computed. */}
      {hulls?.map((hull, i) => {
        const pts = hull.ids.map((id) => placement.get(id)).filter(Boolean) as Point[];
        if (pts.length === 0) return null;
        const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
        const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
        const r = Math.max(28, ...pts.map((p) => Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2))) + 22;
        return (
          <g key={`hull${i}`}>
            <ellipse className={s.hull} cx={px(cx)} cy={px(cy)} rx={px(r * 1.15)} ry={px(r)}
                     style={hull.fill ? { fill: hull.fill } : undefined} />
            {hull.label ? (
              <text className={s.hullLabel} x={px(cx)} y={px(cy - r - 5)} textAnchor="middle">
                {hull.label}
              </text>
            ) : null}
          </g>
        );
      })}

      <g className={s.edges}>
        {edges.map((e, i) => {
          const a = placement.get(e.from);
          const b = placement.get(e.to);
          if (!a || !b || !nodeById.has(e.from) || !nodeById.has(e.to)) return null;
          const faded = near !== null && e.from !== lit && e.to !== lit;
          return (
            <path
              key={`${e.from}-${e.to}-${i}`}
              className={s.edge}
              d={edgePath(a, b, curved)}
              data-kind={e.kind}
              data-sign={e.signed === undefined ? undefined : e.signed < 0 ? "negative" : "positive"}
              data-faded={faded || undefined}
              style={{
                strokeWidth: e.width,
                stroke: e.signed === undefined
                  ? undefined
                  : e.signed >= 0 ? "var(--chart-pos)" : "var(--chart-neg)",
                strokeOpacity: e.signed === undefined ? undefined : 0.25 + Math.min(1, Math.abs(e.signed)) * 0.6,
              }}
            />
          );
        })}
      </g>

      <g className={s.nodes}>
        {nodes.map((n) => {
          const at = placement.get(n.id);
          if (!at) return null;
          const r = n.size ?? DEFAULT_R;
          return (
            <g
              key={n.id}
              className={s.node}
              transform={`translate(${px(at.x)} ${px(at.y)})`}
              data-mark={markOf(n.id)}
              data-selected={selected === n.id || undefined}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={onSelect ? () => onSelect(selected === n.id ? null : n.id) : undefined}
              role={onSelect ? "button" : undefined}
              aria-label={onSelect ? n.label ?? n.id : undefined}
              aria-pressed={onSelect ? selected === n.id : undefined}
              onKeyDown={onSelect ? (event) => {
                if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(selected === n.id ? null : n.id); }
              } : undefined}
              tabIndex={onSelect ? 0 : undefined}
              onFocus={() => setHovered(n.id)}
              onBlur={() => setHovered(null)}
            >
              <path
                className={s.mark}
                d={shapePath(n.shape ?? "circle", r)}
                style={n.fill ? { fill: n.fill } : undefined}
              />
              {labels && n.label ? (
                <text className={s.label} y={r + 11} textAnchor="middle">{n.label}</text>
              ) : null}
            </g>
          );
        })}
      </g>

      {children}
    </svg></div> : <p className={s.message}>No nodes to display.</p>}
    <ChartData title={`${title} nodes`}><THead><Tr><Th>Node</Th><Th>Group</Th>{onSelect && <Th>Selection</Th>}</Tr></THead>
      <TBody>{nodes.map((node) => <Tr key={node.id}><Th scope="row">{node.label ?? node.id}</Th><Td>{node.group ?? "Ungrouped"}</Td>{onSelect && <Td><Button size="sm" intent="ghost" aria-label={`Select ${node.label ?? node.id}`} aria-pressed={selected === node.id} onClick={() => onSelect(selected === node.id ? null : node.id)}>{selected === node.id ? "Selected" : "Select"}</Button></Td>}</Tr>)}</TBody>
    </ChartData>
    <ChartData title={`${title} connections`}><THead><Tr><Th>From</Th><Th>To</Th><Th>Kind</Th><Th numeric>Value</Th></Tr></THead>
      <TBody>{edges.filter((edge) => nodeById.has(edge.from) && nodeById.has(edge.to)).map((edge, index) => <Tr key={index}><Th scope="row">{nodeById.get(edge.from)?.label ?? edge.from}</Th><Td>{nodeById.get(edge.to)?.label ?? edge.to}</Td><Td>{edge.label ?? edge.kind ?? "Connection"}</Td><Td numeric>{edge.signed === undefined ? "Unweighted" : String(edge.signed)}</Td></Tr>)}</TBody>
    </ChartData>
    </>
  );
}

/** Straight, or a shallow arc.
 *
 *  Straight is right for a radial layout — a curve bows every spoke away from
 *  the centre it is pointing at, which is the one thing the layout exists to
 *  show. An arc earns its place on a circular layout, where every edge is a
 *  chord and straight ones overlap into a solid disc. */
function edgePath(a: Point, b: Point, curved: boolean): string {
  if (!curved) return `M ${px(a.x)} ${px(a.y)} L ${px(b.x)} ${px(b.y)}`;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // `sqrt`, not `hypot` — see `_kernel/layout`. This one is single-shot so the
  // divergence would be sub-pixel, and using the exact function everywhere is
  // cheaper than remembering which calls are safe.
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
  // Perpendicular offset proportional to length, so short edges stay nearly
  // straight and long ones bow enough to be told apart.
  const bow = Math.min(distance * 0.18, 46);
  const mx = (a.x + b.x) / 2 - (dy / distance) * bow;
  const my = (a.y + b.y) / 2 + (dx / distance) * bow;
  return `M ${px(a.x)} ${px(a.y)} Q ${px(mx)} ${px(my)} ${px(b.x)} ${px(b.y)}`;
}
