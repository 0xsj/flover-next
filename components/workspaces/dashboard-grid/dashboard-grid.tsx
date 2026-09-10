"use client";

import { useState, type ReactNode } from "react";
import GridLayout, { noCompactor, useContainerWidth, type Layout } from "react-grid-layout";
import { Card, CardBody } from "@/components/display";
import { Button } from "@/components/forms";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/overlays";
import { GripVertical, Settings } from "@/components/utility";
import { cn } from "@/lib/kernel";
import { decodeDashboardLayout, editDashboardLayout, GRID, type DashboardLayout, type GridEdit } from "./model";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import s from "./dashboard-grid.module.css";

export type DashboardWidget = { id: string; title: string; content: ReactNode };
export type DashboardGridProps = {
  label: string;
  widgets: readonly DashboardWidget[];
  layout: DashboardLayout;
  editable?: boolean;
  onLayoutChange?: (layout: DashboardLayout) => void;
  onRemove?: (id: string) => void;
  empty?: ReactNode;
  className?: string;
};
const compactor = { ...noCompactor, preventCollision: true };
const actions: readonly [GridEdit, string][] = [
  ["left", "Move left"], ["right", "Move right"], ["up", "Move up"], ["down", "Move down"],
  ["wider", "Make wider"], ["narrower", "Make narrower"], ["taller", "Make taller"], ["shorter", "Make shorter"],
];

export function DashboardGrid({ label, widgets, layout, editable = false, onLayoutChange, onRemove, empty = "No widgets yet. Add one to start arranging this dashboard.", className }: DashboardGridProps) {
  const { width, containerRef, mounted } = useContainerWidth();
  const [announcement, setAnnouncement] = useState("");
  const stacked = !mounted || width < 640;
  const editing = editable && Boolean(onLayoutChange);
  const engineLayout = layout.map(item => ({ i: item.id, x: item.x, y: item.y, w: item.width, h: item.height,
    minW: GRID.minWidth, minH: GRID.minHeight, maxW: GRID.columns, maxH: GRID.maxHeight }));
  function commit(next: Layout) {
    const parsed = decodeDashboardLayout(next.map(item => ({ id: item.i, x: item.x, y: item.y, width: item.w, height: item.h })));
    if (parsed.ok && JSON.stringify(parsed.value) !== JSON.stringify(layout)) {
      onLayoutChange?.(parsed.value);
      setAnnouncement("Dashboard arrangement changed. Save to keep these changes.");
    }
  }
  function edit(id: string, action: GridEdit) {
    const next = editDashboardLayout(layout, id, action);
    if (next !== layout) {
      onLayoutChange?.(next);
      const item = next.find(item => item.id === id)!;
      setAnnouncement(`${widgets.find(widget => widget.id === id)?.title}: column ${item.x + 1}, row ${item.y + 1}, width ${item.width}, height ${item.height}.`);
    }
  }
  const cards = layout.flatMap(item => {
    const widget = widgets.find(widget => widget.id === item.id);
    if (!widget) return [];
    return [<div key={widget.id} className={s.item} data-widget={widget.id}>
      <Card className={s.card}>
        <div className={s.header}>
          <div className={cn(s.heading, editing && !stacked && s.dragHandle)}>
            {editing && !stacked && <GripVertical size={15} aria-hidden="true" />}
            <h3 className={s.title}>{widget.title}</h3>
          </div>
          {editing && <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="icon" intent="ghost" aria-label={`Arrange ${widget.title}`}><Settings size={15} aria-hidden="true" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{widget.title}</DropdownMenuLabel>
              {!stacked && actions.map(([action, label]) => <DropdownMenuItem key={action}
                disabled={editDashboardLayout(layout, item.id, action) === layout}
                onSelect={() => edit(item.id, action)}>{label}</DropdownMenuItem>)}
              {onRemove && <><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => onRemove(widget.id)}>Remove widget</DropdownMenuItem></>}
            </DropdownMenuContent>
          </DropdownMenu>}
        </div>
        <CardBody className={s.body}>{widget.content}</CardBody>
      </Card>
    </div>];
  });
  return <div ref={containerRef} className={cn(s.dashboard, className)} role="region" aria-label={label}>
    <span className={s.announcement} role="status">{announcement}</span>
    {cards.length === 0 ? <div className={s.empty}>{empty}</div> : stacked ? <>
      {editing && mounted && <p className={s.hint}>Widgets stack on narrow screens. Use a wider workspace to move and resize them.</p>}
      <div className={s.stack}>{cards}</div>
    </> : <GridLayout width={width} layout={engineLayout} compactor={compactor}
      gridConfig={{ cols: GRID.columns, rowHeight: 40, margin: [16, 16], containerPadding: [0, 0], maxRows: GRID.maxRows }}
      dragConfig={{ enabled: editing, handle: `.${s.dragHandle}` }} resizeConfig={{ enabled: editing }}
      onDragStop={commit} onResizeStop={commit}>
      {cards}
    </GridLayout>}
  </div>;
}
