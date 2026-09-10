"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Badge, Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle, Empty } from "@/components/display";
import { Alert } from "@/components/feedback";
import { Button, Field, Input } from "@/components/forms";
import { Flex } from "@/components/layout";
import { Text } from "@/components/typography";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent } from "@/components/overlays";
import { err, ok } from "@/lib/kernel";
import { createLatestRead } from "@/lib/runtime/latest-read";
import { createItemDraft } from "../_components/item-draft";
import type { ItemWorkflow } from "@/lib/root/item-workflow";
import { sameItemDraft, type EditableItem } from "@/lib/services/example/item-workflow";
import s from "./items.module.css";

type EditorModel = ReturnType<typeof createItemDraft>;

/** Key this region by id: a previous item's data is never a loading fallback. */
export function ItemDetail({ root, id, onSaved, onClose }: { root: ItemWorkflow; id: string; onSaved(): void; onClose(): void }) {
  const [reader] = useState(() => createLatestRead(async (reload: boolean, signal) => {
    const result = await root.detail(id, signal);
    if (!result.ok) return err(result.error);
    const saved = root.loadDraft(id); if (!saved.ok) return err(saved.error);
    const model = createItemDraft(root, result.value, reload ? null : saved.value);
    if (reload) { const stored = model.checkpoint(); if (!stored.ok) return err(stored.error); }
    return ok({ item: !reload && saved.value ? saved.value.item : result.value, model });
  }));
  const state = useSyncExternalStore(reader.subscribe, reader.get, reader.server);
  useEffect(() => { void reader.run(false); return () => reader.cancel(); }, [reader]);
  const data = state.state === "ready" ? state.value : state.state === "idle" ? undefined : state.previous;
  return <section aria-label="Selected item" className={s.detail}>
    {state.state === "pending" && <Text role="status">Loading the selected item…</Text>}
    {state.state === "failed" && <Alert tone="warn" title={state.failure.kind === "not_found" ? "Item not found" : "Item details could not be loaded"} action={<Button size="sm" onClick={() => void reader.run(false)}>Retry item</Button>}>{state.failure.message} {data && "The previous item view is still here."}</Alert>}
    {data ? <ItemEditor key={`${data.item.id}:${data.item.revision}`} model={data.model} item={data.item} refreshing={state.state === "pending"} onSaved={onSaved} onReload={() => void reader.run(true)} onClose={onClose} root={root} />
      : state.state !== "pending" && <Empty title="No item details available" body="Choose another item or retry this read." action={<Button onClick={onClose}>Back to the collection</Button>} />}
  </section>;
}

function ItemEditor({ model, item, root, refreshing, onSaved, onReload, onClose }: { model: EditorModel; item: EditableItem; root: ItemWorkflow; refreshing: boolean; onSaved(): void; onReload(): void; onClose(): void }) {
  const state = useSyncExternalStore(model.subscribe, model.get, model.server);
  const [confirm, setConfirm] = useState<"discard" | "reload" | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const lastReceipt = useRef(state.confirmed?.operationId);
  const busy = state.phase.state === "saving" || state.phase.state === "checking";
  const unresolved = busy || state.phase.state === "unknown";
  const dirty = !sameItemDraft(state.draft, state.baseline);
  const failure = state.phase.state === "refused" || state.phase.state === "unknown" ? state.phase.failure : null;
  const fields = failure?.kind === "invalid" ? failure.fields : undefined;
  const submitted = state.phase.state === "refused" ? state.phase.submitted.draft : null;
  const revision = state.confirmed?.item.revision ?? item.revision;
  useEffect(() => {
    if (state.confirmed && lastReceipt.current !== state.confirmed.operationId) { lastReceipt.current = state.confirmed.operationId; onSaved(); }
  }, [state.confirmed, onSaved]);
  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => {
      if (root.isResetting()) return;
      const value = model.get(); model.checkpoint();
      if (!sameItemDraft(value.draft, value.baseline) || "attempt" in value.phase || value.checkpointFailure) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", protect);
    return () => { window.removeEventListener("beforeunload", protect); model.cancel(); };
  }, [model, root]);
  const notice = state.phase.state === "saving" ? "Saving the captured draft. You can keep editing."
    : state.phase.state === "checking" ? "Checking the earlier save. Your current input is unchanged."
      : state.phase.state === "unknown" ? "Save outcome unknown. Check the receipt before sending another save."
        : state.phase.state === "refused" ? "Save refused. Your edits are still here."
          : state.phase.state === "not-recorded" ? "No save was recorded. Your draft is ready for another attempt."
            : state.confirmed ? dirty ? "The earlier draft is saved. Your newer edits are still unsaved." : "Saved. Your current draft matches the confirmed item."
              : dirty ? state.checkpointFailure ? "Unsaved changes. The draft checkpoint failed; keep this page open." : "Unsaved changes. Your draft is checkpointed in this tab." : "This draft matches the loaded item.";
  return <Card aria-labelledby="item-editor-title">
    <CardHeader actions={<Badge tone={unresolved ? "warn" : dirty ? "accent" : "neutral"}>{unresolved ? "Needs resolution" : dirty ? "Unsaved changes" : `Revision ${revision}`}</Badge>}>
      <CardTitle id="item-editor-title" level={2}>Edit {state.confirmed?.item.name ?? item.name}</CardTitle><CardDescription>Item {item.id}. Drafts and demo records stay in this tab, per account, across navigation and reload.</CardDescription>
    </CardHeader>
    <CardBody><Flex direction="column" gap={5}>
      {failure && <Alert tone="warn" title={state.phase.state === "unknown" ? "Check the save outcome" : "The item was not saved"}>{failure.message}</Alert>}
      {state.checkpointFailure && <Alert tone="warn" title="Draft recovery is not protected" action={<Button size="sm" onClick={() => model.checkpoint()}>Retry draft checkpoint</Button>}>{state.checkpointFailure.message} Keep this page open or copy your input before leaving.</Alert>}
      <form ref={form} noValidate onSubmit={async event => { event.preventDefault(); await model.save(); form.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus(); }}>
        <Flex direction="column" gap={5}>
          <Field label="Item name" required error={submitted?.name === state.draft.name ? fields?.name : undefined}>{control => <Input {...control} name="name" maxLength={120} value={state.draft.name} onChange={event => model.edit({ ...state.draft, name: event.target.value })} />}</Field>
          <Field label="Hostname" required error={submitted?.host === state.draft.host ? fields?.host : undefined} hint="Use letters, numbers, dots or hyphens. Hostnames must be unique.">{control => <Input {...control} name="host" maxLength={253} value={state.draft.host} onChange={event => model.edit({ ...state.draft, host: event.target.value })} />}</Field>
          <Flex gap={3} wrap>
            <Button type="submit" intent="primary" disabled={!dirty || unresolved || refreshing}>Save changes</Button>
            <Button type="button" disabled={!dirty || unresolved || refreshing} onClick={() => setConfirm("discard")}>Discard edits</Button>
            <Button type="button" disabled={unresolved || refreshing} onClick={() => setConfirm("reload")}>Reload saved version</Button>
            {state.phase.state === "unknown" && <Button type="button" intent="primary" onClick={() => void model.check()}>Check save outcome</Button>}
            {state.phase.state === "saving" && root.isHolding() && <Button type="button" onClick={() => root.release()}>Release held response</Button>}
            {busy && <Button type="button" onClick={() => model.cancel()}>Stop waiting</Button>}
          </Flex>
        </Flex>
      </form>
      <Text size="sm" role="status" aria-atomic="true">{notice}</Text>
      {state.confirmed && <Text size="sm" tone="muted">Confirmed: {state.confirmed.item.name} · {state.confirmed.item.host} · revision {state.confirmed.item.revision}</Text>}
    </Flex></CardBody>
    <CardFooter><Text size="sm" tone="muted">Selecting another item keeps this draft for your return.</Text><Button size="sm" onClick={onClose}>Close item</Button></CardFooter>
    <AlertDialog open={confirm !== null} onOpenChange={open => { if (!open) setConfirm(null); }}><AlertDialogContent title={confirm === "reload" ? "Load the saved version?" : "Discard these edits?"} description={confirm === "reload" ? "The saved item will replace this draft. Any unsaved input in this editor will be discarded." : "This editor will return to its last confirmed values. This cannot be undone."}>
      <AlertDialogCancel asChild><Button>Keep editing</Button></AlertDialogCancel><AlertDialogAction asChild><Button intent="danger" onClick={() => { if (confirm === "reload") onReload(); else model.discard(); setConfirm(null); }}>{confirm === "reload" ? "Load saved version" : "Discard edits"}</Button></AlertDialogAction>
    </AlertDialogContent></AlertDialog>
  </Card>;
}
