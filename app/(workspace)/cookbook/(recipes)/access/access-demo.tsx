"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Badge, Card, CardBody, CardDescription, CardHeader, CardTitle, Empty } from "@/components/display";
import { Alert } from "@/components/feedback";
import { Button, Checkbox, Field } from "@/components/forms";
import { Flex } from "@/components/layout";
import { Text } from "@/components/typography";
import { createAccessExample } from "@/lib/root/access";
import { createCapabilities } from "@/lib/runtime/capabilities";
import { createLatestRead } from "@/lib/runtime/latest-read";
import s from "../_components/recipe.module.css";

export function AccessDemo({ accountId }: { accountId: string }) {
  const [root] = useState(() => createAccessExample(accountId));
  const [access] = useState(() => createCapabilities(accountId, "workspace", root.permissions));
  const [operation] = useState(() => createLatestRead(async (action: "view" | "edit", signal) => {
    const result = await (action === "view" ? root.read(signal) : root.update(signal));
    if (!signal.aborted && !result.ok && result.error.kind === "forbidden") access.invalidate();
    return result;
  }));
  const state = useSyncExternalStore(access.subscribe, access.get, access.server);
  const work = useSyncExternalStore(operation.subscribe, operation.get, operation.server);
  const [offline, setOffline] = useState(false), [silent, setSilent] = useState(false);
  useEffect(() => { void access.refresh(); return () => { access.dispose(); operation.cancel(); }; }, [access, operation]);
  const view = access.decide("view"), edit = access.decide("edit");
  const change = (canView: boolean, canEdit: boolean) => { root.setAccess(canView, canEdit); setSilent(false); operation.cancel(); access.invalidate(); void access.refresh(); };
  return <>
    <div className={s.columns}><Card><CardHeader actions={<Badge>{state.state}</Badge>}><CardTitle level={2}>Protected workspace</CardTitle><CardDescription>The backend sends decisions for this account and resource. The UI does not reconstruct them from role names.</CardDescription></CardHeader><CardBody><Flex direction="column" gap={5}>
      {state.state === "failed" && <Alert tone="warn" title="Permissions could not be verified">{state.failure.message} Previous grants are no longer actionable.</Alert>}
      {([['Read workspace', view], ['Edit workspace', edit]] as const).map(([label, decision]) => <div key={label}><Text weight="medium">{label}: {decision.allowed ? "Allowed" : "Unavailable"}</Text>{!decision.allowed && <Text size="sm" tone="muted">{decision.reason}</Text>}</div>)}
      <Flex wrap gap={3}><Button disabled={!view.allowed || work.state === "pending"} onClick={() => { if (access.decide("view").allowed) void operation.run("view"); }}>Open protected content</Button><Button intent="primary" disabled={!edit.allowed || work.state === "pending"} onClick={() => { if (access.decide("edit").allowed) void operation.run("edit"); }}>Update workspace</Button><Button loading={state.state === "loading"} onClick={() => void access.refresh()}>Refresh permissions</Button></Flex>
      {work.state === "pending" && <Text role="status">Waiting for the server…</Text>}
      {work.state === "failed" && <Alert tone="warn" title={work.failure.kind === "forbidden" ? "Access refused by the server" : "The operation failed"}>{work.failure.message}</Alert>}
      {view.allowed && work.state === "ready" ? <Text role="status">{work.value}</Text> : !view.allowed && <Empty title="Protected content is hidden" body="Verify access before showing this account’s workspace." />}
    </Flex></CardBody></Card>
    <Card><CardHeader><CardTitle level={2}>Change the authority</CardTitle><CardDescription>The next request checks the simulated server’s current policy, including when the page still has an older grant.</CardDescription></CardHeader><CardBody><Flex direction="column" gap={5}>
      <Flex wrap gap={3}><Button onClick={() => change(true, true)}>Grant full access</Button><Button onClick={() => change(true, false)}>Make read-only</Button><Button onClick={() => change(false, false)}>Revoke and notify</Button></Flex>
      <Button onClick={() => { root.setAccess(false, false); setSilent(true); }}>Revoke without notifying this page</Button>
      {silent && <Alert tone="info" title="The page has not heard about the change">Try an enabled action. The server will refuse it, and the page will invalidate its old permissions.</Alert>}
      <Button onClick={() => void operation.run("view")}>Probe a server-protected read</Button>
      <Field label="Make permission reads unavailable">{control => <Checkbox {...control} checked={offline} onCheckedChange={value => { setOffline(value === true); root.setOffline(value === true); void access.refresh(); }} />}</Field>
    </Flex></CardBody></Card></div>
    <Text size="sm" tone="muted">Frontend: explain denied actions, withdraw stale grants, and hide protected content when access is invalidated. Backend: authorize every read and write. Disabling or hiding a button provides no server-side authorization. This simulation stays separate from your real session.</Text>
  </>;
}
