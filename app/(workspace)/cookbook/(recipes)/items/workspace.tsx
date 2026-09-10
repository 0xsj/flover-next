"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Card, CardBody, CardDescription, CardHeader, CardTitle, Empty, Table, TBody, Td, Th, THead, Tr } from "@/components/display";
import { Alert } from "@/components/feedback";
import { Button, Field, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/forms";
import { Flex } from "@/components/layout";
import { Pagination } from "@/components/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent } from "@/components/overlays";
import { CollectionToolbar } from "@/components/patterns";
import { Text } from "@/components/typography";
import type { Failure, Result } from "@/lib/kernel";
import { createItemWorkflow, type ItemWorkflow } from "@/lib/root/item-workflow";
import { createLatestRead } from "@/lib/runtime/latest-read";
import { useUrlState } from "@/lib/runtime/url-state";
import { DiagnosticTimeline } from "../_components/diagnostic-timeline";
import { ItemDetail } from "./item-editor";
import { Scenarios } from "./scenarios";
import { itemQuery, PAGE_SIZE, selectItems, type ItemView } from "./collection";
import s from "./items.module.css";

export function ItemWorkspace({ accountId }: { accountId: string }) {
  const [root] = useState(() => createItemWorkflow(accountId));
  const [initialized, setInitialized] = useState<Result<void> | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => { if (active) setInitialized(root.initialize()); });
    return () => { active = false; root.dispose(); };
  }, [root]);
  return <Flex direction="column" gap={7}>
    <Alert tone="info" title="A complete workflow over a tab-local demo">Records, save receipts and private drafts are stored separately in this tab, per account. Reloading keeps them; closing the tab ends the demo. Share the address to share a view of the sample items, not your private edits.</Alert>
    {initialized === null ? <Text role="status">Opening the item workspace…</Text> : !initialized.ok ? <Alert tone="warn" title="The item workspace could not be opened" action={<Button onClick={() => setInitialized(root.initialize())}>Retry opening</Button>}>{initialized.error.message} Existing documents have not been replaced.</Alert>
      : <WorkspaceContents root={root} />}
    <Flex justify="space-between" align="center" gap={4} wrap><Text size="sm" tone="muted">This example requires durable operation receipts from a real backend before adopting its save recovery.</Text><Button size="sm" onClick={() => setResetOpen(true)}>Reset item demo</Button></Flex>
    <AlertDialog open={resetOpen} onOpenChange={setResetOpen}><AlertDialogContent title="Reset the item demo?" description="All item changes, draft checkpoints and save receipts for this demo account in this tab will be removed. Other cookbook data is unaffected.">
      <AlertDialogCancel asChild><Button>Keep the demo</Button></AlertDialogCancel><AlertDialogAction asChild><Button intent="danger" onClick={() => {
        root.dispose(); const result = root.reset(); setInitialized(result.ok ? null : result);
        if (result.ok) window.location.reload();
      }}>Reset demo data</Button></AlertDialogAction>
    </AlertDialogContent></AlertDialog>
  </Flex>;
}

function WorkspaceContents({ root }: { root: ItemWorkflow }) {
  const url = useUrlState(itemQuery), view = url.value;
  const [failure, setFailure] = useState<Failure | null>(null);
  const [reader] = useState(() => createLatestRead((_input: undefined, signal) => root.list(signal)));
  const state = useSyncExternalStore(reader.subscribe, reader.get, reader.server);
  const refresh = useCallback(() => { void reader.run(undefined); }, [reader]);
  useEffect(() => { refresh(); return () => reader.cancel(); }, [reader, refresh]);
  const data = state.state === "ready" ? state.value : state.state === "idle" ? undefined : state.previous;
  const selected = data ? selectItems(data, view) : null;
  const outside = selected && selected.total > 0 && view.page > selected.pages;
  const change = (update: (current: ItemView) => ItemView, replace = false) => {
    const result = url.update(update, replace ? "replace" : "push"); setFailure(result.ok ? null : result.error);
  };
  return <Flex direction="column" gap={7}>
    {failure && <Alert tone="warn" title="The view address could not be updated">{failure.message}</Alert>}
    {url.issues.length > 0 && <Alert tone="warn" title="Some URL values could not be used" action={<Button size="sm" onClick={() => change(current => current, true)}>Use valid URL values</Button>}><ul>{url.issues.map(issue => <li key={issue.key}>{issue.message}</li>)}</ul></Alert>}
    <Scenarios root={root} />
    <div className={s.workspace}>
      <Card aria-labelledby="items-title"><CardHeader actions={<Button size="sm" disabled={state.state === "pending"} onClick={refresh}>Refresh collection</Button>}><CardTitle id="items-title" level={2}>Items</CardTitle><CardDescription>Open an item to edit. Filtering the collection keeps the selected item open.</CardDescription></CardHeader>
        <CardBody><Flex direction="column" gap={5}>
          <CollectionToolbar>
            <form key={view.q} className={s.search} onSubmit={event => { event.preventDefault(); const q = String(new FormData(event.currentTarget).get("q") ?? ""); change(current => ({ ...current, q, page: 1 })); }}>
              <Field label="Search items">{control => <Input {...control} name="q" defaultValue={view.q} maxLength={80} placeholder="Name or hostname" />}</Field><Button type="submit">Search</Button>
            </form>
            <div className={s.choice}><Field label="Host filter">{control => <Select value={view.scope} onValueChange={scope => { if (scope === "all" || scope === "internal" || scope === "public") change(current => ({ ...current, scope, page: 1 })); }}><SelectTrigger {...control}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All hosts</SelectItem><SelectItem value="internal">Internal hosts</SelectItem><SelectItem value="public">Public hosts</SelectItem></SelectContent></Select>}</Field></div>
            <div className={s.choice}><Field label="Sort items">{control => <Select value={view.sort} onValueChange={sort => { if (sort === "name" || sort === "host") change(current => ({ ...current, sort, page: 1 })); }}><SelectTrigger {...control}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="name">Name</SelectItem><SelectItem value="host">Hostname</SelectItem></SelectContent></Select>}</Field></div>
          </CollectionToolbar>
          {state.state === "failed" && <Alert tone="warn" title="The collection could not be refreshed">{state.failure.message} {data && "Previously accepted items remain visible and may be stale."}</Alert>}
          <Text size="sm" tone="muted" role="status">{state.state === "pending" ? "Loading items…" : !selected ? "No collection has been accepted yet." : selected.total === 0 ? "No items match these filters." : outside ? `Page ${view.page} is outside the ${selected.pages} available pages.` : `Showing ${(view.page - 1) * PAGE_SIZE + 1}–${Math.min(view.page * PAGE_SIZE, selected.total)} of ${selected.total} items. Page ${view.page} of ${selected.pages}.`}</Text>
          {selected && (selected.total === 0 ? <Empty title="No matching items" body="Try another search or host filter." action={<Button onClick={() => change(current => ({ ...itemQuery.defaults, item: current.item }))}>Clear item filters</Button>} />
            : outside ? <Empty title="This page is outside the results" action={<Button onClick={() => change(current => ({ ...current, page: 1 }))}>Go to first page</Button>} />
              : <Table caption="Items in this view" scrollLabel="Item collection"><THead><Tr><Th>Item</Th><Th>Hostname</Th></Tr></THead><TBody>{selected.rows.map(item => <Tr key={item.id} data-selected={view.item === item.id || undefined}><Td><Button size="sm" intent="ghost" aria-label={`Open ${item.name}`} aria-pressed={view.item === item.id} onClick={() => change(current => ({ ...current, item: item.id }))}>{item.name}</Button></Td><Td className={s.host}>{item.host}</Td></Tr>)}</TBody></Table>)}
          {selected && !outside && <Pagination label="Item pages" page={view.page} totalPages={selected.pages} onPageChange={page => change(current => ({ ...current, page }))} />}
        </Flex></CardBody>
      </Card>
      {view.item ? <ItemDetail key={view.item} root={root} id={view.item} onSaved={refresh} onClose={() => change(current => ({ ...current, item: "" }))} />
        : <Card><CardBody><Empty title="Choose an item" body="Open a row to inspect and edit its details. The selected item is part of this view’s address." /></CardBody></Card>}
    </div>
    <DiagnosticTimeline buffer={root.diagnostics} />
  </Flex>;
}
