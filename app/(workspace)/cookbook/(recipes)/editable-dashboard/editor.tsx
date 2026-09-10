"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/forms";
import { Alert, Skeleton } from "@/components/feedback";
import { Flex } from "@/components/layout";
import { Text } from "@/components/typography";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/overlays";
import { DashboardGrid, GRID, decodeDashboardLayout, type DashboardLayout } from "@/components/workspaces";
import { createBrowserStorage, createDocument } from "@/lib/storage";
import { useStoredDocument } from "@/lib/runtime/hooks";
import type { Failure } from "@/lib/kernel";
import { DEFAULT_LAYOUT, WIDGETS } from "./widgets";

const schema = { key: "layout", version: 1, decode: decodeDashboardLayout };
export function DashboardEditor({ accountId }: { accountId: string }) {
  const document = useMemo(() => createDocument(createBrowserStorage(), `flover.cookbook.dashboard.${accountId}`, schema), [accountId]);
  const snapshot = useStoredDocument(document);
  const [draft, setDraft] = useState<{ layout: DashboardLayout; base: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [writeFailure, setWriteFailure] = useState<Failure | null>(null);
  const [notice, setNotice] = useState("");
  if (snapshot.state === "loading") return <div aria-busy="true" aria-label="Loading saved dashboard"><Skeleton height="440px" /></div>;
  const { result } = snapshot;
  const saved = result.ok && result.value.state === "found" ? result.value.value : DEFAULT_LAYOUT;
  const stamp = result.ok ? JSON.stringify(result.value) : "unreadable";
  const layout = draft?.layout ?? saved;
  const externalChange = draft !== null && draft.base !== stamp;
  function change(layout: DashboardLayout) {
    setDraft(previous => ({ layout, base: previous?.base ?? stamp }));
    setWriteFailure(null); setNotice("");
  }
  function save() {
    const saved = document.write(layout);
    if (!saved.ok) { setWriteFailure(saved.error); return; }
    setDraft(null); setWriteFailure(null); setNotice("Layout saved in this browser.");
  }
  function reset() {
    const removed = document.remove();
    if (!removed.ok) { setWriteFailure(removed.error); return; }
    setDraft(null); setWriteFailure(null); setNotice("Saved layout reset. The default arrangement is showing.");
  }
  const available = WIDGETS.filter(widget => !layout.some(item => item.id === widget.id));
  const bottom = layout.reduce((max, item) => Math.max(max, item.y + item.height), 0);
  const widgets = layout.map(item => {
    const widget = WIDGETS.find(widget => widget.id === item.id);
    return { id: item.id, title: widget?.title ?? "Unavailable widget", content: widget ? widget.content() : <Text>This saved widget is no longer installed. You can remove it while customizing.</Text> };
  });
  return <Flex direction="column" gap={7}>
    <Flex justify="space-between" align="center" gap={5} wrap>
      <Text size="sm" tone="muted">{draft ? "Unsaved changes" : result.ok && result.value.state === "found" ? "Saved in this browser" : "Default arrangement"} · sample data</Text>
      <Flex gap={4} wrap>
        {editing && <DropdownMenu><DropdownMenuTrigger asChild><Button disabled={!available.length || bottom + 5 > GRID.maxRows}>Add widget</Button></DropdownMenuTrigger>
          <DropdownMenuContent>{available.map(widget => <DropdownMenuItem key={widget.id} onSelect={() => change([...layout, { id: widget.id, x: 0, y: bottom, width: 6, height: 5 }])}>{widget.title}</DropdownMenuItem>)}</DropdownMenuContent>
        </DropdownMenu>}
        {draft && <Button onClick={() => { setDraft(null); setWriteFailure(null); }}>Discard edits</Button>}
        <Button onClick={() => setEditing(value => !value)}>{editing ? "Done editing" : "Customize"}</Button>
        <Button intent="primary" disabled={!draft || !result.ok || externalChange} onClick={save}>Save layout</Button>
      </Flex>
    </Flex>
    {!result.ok && <Alert tone="warn" title="Saved layout could not be loaded" action={<Button size="sm" onClick={reset}>Reset saved layout</Button>}>
      {result.error.message} The default arrangement is available to preview; the saved document has not been replaced.
    </Alert>}
    {snapshot.watchFailure && result.ok && <Alert tone="warn" title="Changes in other tabs cannot be observed">{snapshot.watchFailure.message}</Alert>}
    {writeFailure && <Alert tone="warn" title="Your changes were not saved" live="polite">{writeFailure.message} Your current arrangement is still here.</Alert>}
    {externalChange && <Alert tone="warn" title="The saved layout changed elsewhere" action={<Button size="sm" onClick={() => setDraft(null)}>Load saved layout</Button>}>
      Your unsaved edits are still here. Load the newer saved layout before continuing so it is not overwritten by accident.
    </Alert>}
    {editing && <Text size="sm" tone="muted">Drag a widget by its heading, resize from its lower corner, or open its arrange menu for keyboard controls. Occupied spaces stay reserved.</Text>}
    <DashboardGrid label="Customizable dashboard" widgets={widgets} layout={layout} editable={editing}
      onLayoutChange={change} onRemove={id => change(layout.filter(item => item.id !== id))} />
    <Flex justify="space-between" align="center" gap={5} wrap>
      <Text size="sm" tone="muted"><span role="status">{notice || "Your arrangement is saved per account on this browser. Narrow screens stack widgets without changing it."}</span></Text>
      {result.ok && <Button size="sm" intent="ghost" onClick={reset}>Reset saved layout</Button>}
    </Flex>
  </Flex>;
}
