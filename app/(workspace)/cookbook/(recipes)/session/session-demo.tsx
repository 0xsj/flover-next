"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/display";
import { Alert } from "@/components/feedback";
import { Button, Checkbox, Field, Input } from "@/components/forms";
import { Flex } from "@/components/layout";
import { Text } from "@/components/typography";
import { err, ok } from "@/lib/kernel";
import { createSessionExample } from "@/lib/root/session-recovery";
import { createSessionRecovery } from "@/lib/runtime/session-recovery";
import { createLatestRead } from "@/lib/runtime/latest-read";
import { sameItemDraft } from "@/lib/services/example/item-workflow";
import { createItemDraft } from "../_components/item-draft";
import { ScenarioChoice } from "../_components/scenario-choice";
import s from "../_components/recipe.module.css";

export function SessionDemo({ accountId }: { accountId: string }) {
  const [root] = useState(() => createSessionExample(accountId));
  const [session] = useState(() => createSessionRecovery(accountId, "/cookbook/session?view=editor#draft", root.verify));
  const [reader] = useState(() => createLatestRead(async (_: undefined, signal) => {
    const initialized = root.initialize(); if (!initialized.ok) return err(initialized.error);
    const item = await root.detail("api", signal); if (!item.ok) return err(item.error);
    const saved = root.loadDraft("api"); if (!saved.ok) return err(saved.error);
    const model = createItemDraft({ ...root, save: async (attempt, signal) => { const result = await root.save(attempt, signal); if (!result.ok) session.observe(result.error); return result; } }, item.value, saved.value);
    return ok(model);
  }));
  const data = useSyncExternalStore(reader.subscribe, reader.get, reader.server);
  useEffect(() => { void reader.run(undefined); return () => { reader.cancel(); session.dispose(); root.dispose(); }; }, [reader, root, session]);
  return <>
    <Alert tone="info" title="A separate demo session">These controls simulate authentication for this example only. Your real cookbook sign-in stays active. Drafts and receipts are scoped to your account and retained in this tab across reload.</Alert>
    {data.state === "ready" ? <Editor model={data.value} root={root} session={session} /> : data.state === "failed" ? <Alert tone="warn" title="The saved workspace could not be opened" action={<Button onClick={() => void reader.run(undefined)}>Retry workspace</Button>}>{data.failure.message} Existing stored data has been preserved.</Alert> : <Text role="status">Opening the saved workspace…</Text>}
    <Text size="sm" tone="muted">Frontend: checkpoint input, gate actions, verify the returning account, and keep an uncertain operation unresolved. Backend: authenticate every request, authorize account-scoped receipts, and provide a final save outcome. Browser storage is convenience persistence, not secure isolation from other users of this browser.</Text>
  </>;
}
function Editor({ model, root, session }: { model: ReturnType<typeof createItemDraft>; root: ReturnType<typeof createSessionExample>; session: ReturnType<typeof createSessionRecovery> }) {
  const draft = useSyncExternalStore(model.subscribe, model.get, model.server);
  const auth = useSyncExternalStore(session.subscribe, session.get, session.server);
  const [account, setAccount] = useState<"owner" | "other">("owner");
  const [expiry, setExpiry] = useState(false), [offline, setOffline] = useState(false);
  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => { const saved = model.checkpoint(); if (!saved.ok) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", protect);
    return () => { window.removeEventListener("beforeunload", protect); model.cancel(); };
  }, [model]);
  const unresolved = "attempt" in draft.phase;
  const dirty = !sameItemDraft(draft.draft, draft.baseline);
  const active = auth.state === "active";
  return <div className={s.columns}>
    {active ? <Card id="draft" aria-labelledby="session-editor-title"><CardHeader><CardTitle level={2} id="session-editor-title">Your recovered workspace</CardTitle><CardDescription>Returning to the same account restores the editor. Saving still requires an explicit action.</CardDescription></CardHeader><CardBody><Flex direction="column" gap={5}>
      <Field label="Draft name" error={draft.phase.state === "refused" && draft.phase.failure.kind === "invalid" && draft.phase.submitted.draft.name === draft.draft.name ? draft.phase.failure.fields.name : undefined}>{control => <Input {...control} maxLength={120} value={draft.draft.name} onChange={event => model.edit({ ...draft.draft, name: event.target.value })} />}</Field>
      <Text size="sm">Host: {draft.draft.host}</Text>
      <Flex wrap gap={3}><Button intent="primary" disabled={!dirty || unresolved} onClick={() => { if (session.canContinue()) void model.save(); }}>Save draft</Button><Button disabled={draft.phase.state !== "unknown"} onClick={() => { if (session.canContinue()) void model.check(); }}>Check original save</Button></Flex>
      <Text role="status">{unresolved ? "Save outcome unknown until the original receipt is confirmed." : draft.confirmed ? dirty ? "Earlier save confirmed. Newer edits remain unsaved." : "Save confirmed. Your draft matches the receipt." : dirty ? "Unsaved draft retained in this tab." : "Ready to edit."}</Text>
      {(draft.phase.state === "unknown" || draft.phase.state === "refused") && <Alert tone="warn" title="Save needs attention">{draft.phase.failure.message}</Alert>}
    </Flex></CardBody></Card> : <Card><CardHeader><CardTitle level={2}>Sign in to resume</CardTitle><CardDescription>The editor is hidden until the original account is verified. The draft and original operation remain in its workspace.</CardDescription></CardHeader><CardBody><Flex direction="column" gap={5}>
      <ScenarioChoice label="Demo sign-in account" value={account} options={[{ value: "owner", label: "Original account" }, { value: "other", label: "Different account" }]} onChange={setAccount} />
      {auth.state === "wrong-account" && <Alert tone="warn" title="This is a different account">Return with the original account to resume its draft. Nothing was sent or copied to this account.</Alert>}
      {auth.state === "expired" && auth.failure && <Alert tone="warn" title="Verification failed">{auth.failure.message}</Alert>}
      <Button intent="primary" loading={auth.state === "checking"} onClick={async () => { root.signInAs(account); if (await session.recover()) { window.history.replaceState(null, "", session.returnTo); requestAnimationFrame(() => document.getElementById("draft")?.scrollIntoView({ block: "nearest" })); } }}>Simulate sign-in and return</Button>
      <Text size="sm">Return address: {session.returnTo}</Text>
    </Flex></CardBody></Card>}
    <Card><CardHeader><CardTitle level={2}>Session scenarios</CardTitle><CardDescription>Try expiry before saving, then expiry after the server has committed.</CardDescription></CardHeader><CardBody><Flex direction="column" gap={5}>
      <Button disabled={!active} onClick={() => { model.checkpoint(); model.cancel(); root.expire(); session.expire(); }}>Expire demo session now</Button>
      <Field label="Expire after a save commits">{control => <Checkbox {...control} checked={expiry} onCheckedChange={value => { setExpiry(value === true); root.setExpireAfterCommit(value === true); }} />}</Field>
      <Field label="Make sign-in verification unavailable">{control => <Checkbox {...control} checked={offline} onCheckedChange={value => { setOffline(value === true); root.setVerifyUnavailable(value === true); }} />}</Field>
      <Text size="sm" role="status">Session: {auth.state}. Draft checkpoint: {draft.checkpointFailure ? "failed" : "available"}.</Text>
      {draft.checkpointFailure && <Alert tone="warn" title="Keep this page open" action={<Button onClick={() => model.checkpoint()}>Retry checkpoint</Button>}>{draft.checkpointFailure.message} Copy your input before leaving; recovery has not been protected.</Alert>}
    </Flex></CardBody></Card>
  </div>;
}
