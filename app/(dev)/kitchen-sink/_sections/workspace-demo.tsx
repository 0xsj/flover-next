"use client";

import { useState } from "react";
import { Canvas, DashboardGrid, type DashboardLayout } from "@/components/workspaces";
import { Button } from "@/components/forms";
import { Flex } from "@/components/layout";
import { Stat } from "@/components/display";
import { Text } from "@/components/typography";

const initial: DashboardLayout = [{ id: "a", x: 0, y: 0, width: 6, height: 4 }, { id: "b", x: 6, y: 0, width: 6, height: 4 }];
export function GridDemo({ readOnly = false, empty = false }: { readOnly?: boolean; empty?: boolean }) {
  const [layout, setLayout] = useState(empty ? [] : initial);
  return <Flex direction="column" gap={6}>
    {!readOnly && !empty && <Button size="sm" onClick={() => setLayout(initial)}>Reset arrangement</Button>}
    <DashboardGrid label={readOnly ? "Read-only dashboard" : empty ? "Empty dashboard" : "Editable dashboard example"} layout={layout} editable={!readOnly}
      onLayoutChange={setLayout} widgets={[
        { id: "a", title: "Measured", content: <Stat label="Completed tasks" value={0} hint="a real zero" /> },
        { id: "b", title: "Unmeasured", content: <Stat label="Pending estimate" hint="no measurement yet" /> },
      ]} />
  </Flex>;
}
export function CanvasDemo({ empty = false, readOnly = false }: { empty?: boolean; readOnly?: boolean }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedId, select] = useState<string | null>(null);
  return <Canvas label={empty ? "Empty canvas" : readOnly ? "Locked canvas" : "Interactive canvas example"}
    nodes={empty ? [] : [{ id: "item", label: "An idea", position, content: <Text weight="strong">An idea</Text> }]}
    selectedId={selectedId} onSelect={select} onPositionsChange={readOnly ? undefined : positions => { const next = positions.get("item"); if (next) setPosition(next); }} />;
}
