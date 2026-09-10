"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Badge, Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/display";
import { Alert } from "@/components/feedback";
import { Button } from "@/components/forms";
import { Flex } from "@/components/layout";
import { Text } from "@/components/typography";
import { createMemoryDiagnostics, createTrace } from "@/lib/diagnostics";
import { beginInteraction } from "@/lib/runtime";
import { createLatestRead } from "@/lib/runtime/latest-read";
import { readResponseExample, type ResponseMode } from "@/lib/root/resilience";
import { DiagnosticTimeline } from "../_components/diagnostic-timeline";
import s from "./diagnostics.module.css";

const SCENARIOS: Array<{ mode: ResponseMode; label: string }> = [
  { mode: "valid", label: "Successful read" }, { mode: "malformed", label: "Malformed success" },
  { mode: "unavailable", label: "Transport failure" }, { mode: "empty", label: "Empty result" },
  { mode: "held", label: "Hold response" },
];

export function DiagnosticsDemo() {
  const [buffer] = useState(() => createMemoryDiagnostics({ capacity: 120 }));
  const [reader] = useState(() => createLatestRead((input: { mode: ResponseMode; recovery?: boolean }, signal) => {
    const trace = createTrace(buffer.port, { operation: input.recovery ? "items.recover" : "items.load", correlationId: beginInteraction() });
    return trace.run(input.recovery ? "recovery" : "operation", () => readResponseExample(input.mode, signal, trace));
  }));
  const [cancelRequested, setCancelRequested] = useState(false);
  const state = useSyncExternalStore(reader.subscribe, reader.get, reader.server);
  useEffect(() => () => reader.cancel(), [reader]);
  const pending = state.state === "pending";
  const data = state.state === "ready" ? state.value : state.state === "idle" ? undefined : state.previous;
  const status = cancelRequested ? "Request canceled. The last settled view is retained."
    : state.state === "pending" ? "Request in progress. A held response waits until you cancel it."
      : state.state === "failed" ? `Read failed: ${state.failure.kind}. ${data === undefined ? "No data has been accepted." : "Previous data remains visible and may be stale."}`
        : state.state === "ready" ? "Read completed. Inspect the request and decode steps below." : "Choose a scenario to begin recording.";

  function run(mode: ResponseMode, recovery = false) { setCancelRequested(false); void reader.run({ mode, recovery }); }

  return <Flex direction="column" gap={7}>
    <Alert tone="info" title="An isolated, visit-local inspector">These sample reads use the real service and response decoder over memory fixtures. The recorder receives classifications and timing; request contents and failure messages stay out of the timeline.</Alert>
    <Card aria-labelledby="diagnostic-read-title"><CardHeader actions={<Badge tone={pending ? "accent" : state.state === "failed" ? "warn" : "neutral"}>{pending ? "In progress" : state.state === "failed" ? "Read failed" : "Sample data"}</Badge>}>
      <CardTitle id="diagnostic-read-title" level={2}>Drive the request</CardTitle>
      <CardDescription>A malformed success produces a successful request span followed by a failed decode span.</CardDescription>
    </CardHeader><CardBody><Flex direction="column" gap={5}>
      {state.state === "failed" && <Alert tone="warn" title="This region could not be refreshed">{state.failure.message}</Alert>}
      <div aria-busy={pending}>{data === undefined ? <Text tone="muted">No successful read yet.</Text>
        : data.length === 0 ? <Text>The request succeeded. No items were found.</Text>
          : <div className={s.items}>{data.map(item => <div key={item.id} className={s.item}><Text weight="medium">{item.name}</Text><Text size="sm" tone="muted">{item.host}</Text></div>)}</div>}</div>
      <Text size="sm" role="status" aria-atomic="true">{status}</Text>
    </Flex></CardBody><CardFooter><Flex gap={3} wrap>
      {SCENARIOS.map(({ mode, label }) => <Button key={mode} size="sm" disabled={pending} onClick={() => run(mode)}>{label}</Button>)}
      <Button size="sm" disabled={!pending} onClick={() => { reader.cancel(); setCancelRequested(true); }}>Cancel request</Button>
      <Button size="sm" intent="primary" disabled={pending || (state.state !== "failed" && !cancelRequested)} onClick={() => run("valid", true)}>Recover read</Button>
    </Flex></CardFooter></Card>

    <DiagnosticTimeline buffer={buffer} pending={pending} />
  </Flex>;
}
