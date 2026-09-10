"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Badge, Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle, Empty, Table, TBody, Td, Th, THead, Tr } from "@/components/display";
import { Alert } from "@/components/feedback";
import { Button, Field, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/forms";
import { Flex } from "@/components/layout";
import { Text } from "@/components/typography";
import { createMemoryDiagnostics, createTrace } from "@/lib/diagnostics";
import { beginInteraction } from "@/lib/runtime";
import { createLatestRead } from "@/lib/runtime/latest-read";
import { readResponseExample, type ResponseMode } from "@/lib/root/resilience";
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
  const [selected, setSelected] = useState("all");
  const [cancelRequested, setCancelRequested] = useState(false);
  const snapshot = useSyncExternalStore(buffer.subscribe, buffer.get, buffer.server);
  const state = useSyncExternalStore(reader.subscribe, reader.get, reader.server);
  useEffect(() => () => reader.cancel(), [reader]);
  const pending = state.state === "pending";
  const data = state.state === "ready" ? state.value : state.state === "idle" ? undefined : state.previous;
  const traces = [...new Map(snapshot.entries.map(({ event }) => [event.traceId, event])).values()];
  const selection = traces.some(trace => trace.traceId === selected) ? selected : "all";
  const entries = snapshot.entries.filter(entry => selection === "all" || entry.event.traceId === selection);
  const activeTrace = traces.find(trace => trace.traceId === selection);
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

    <Card aria-labelledby="timeline-title"><CardHeader actions={<Button size="sm" disabled={pending || snapshot.entries.length === 0} onClick={() => { buffer.clear(); setSelected("all"); }}>Clear timeline</Button>}>
      <CardTitle id="timeline-title" level={2}>Interaction timeline</CardTitle>
      <CardDescription>Ordered by observation. Each span has a start and finish; recording never retries the operation.</CardDescription>
    </CardHeader><CardBody><Flex direction="column" gap={5}>
      <div className={s.filter}><Field label="Trace">{control => <Select value={selection} onValueChange={setSelected} disabled={!traces.length}>
        <SelectTrigger {...control}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All traces</SelectItem>
          {traces.map(trace => <SelectItem key={trace.traceId} value={trace.traceId}>{trace.operation} · {trace.traceId.slice(0, 8)}</SelectItem>)}
        </SelectContent></Select>}</Field></div>
      {activeTrace && <Text size="sm" tone="muted" className={s.identifier}>Correlation: {activeTrace.correlationId}</Text>}
      {entries.length === 0 ? <Empty title="No recorded steps" body="Run a scenario to see the path from interaction to request, decoding, and outcome." />
        : <div className={s.timeline}><Table className={s.events} caption="Diagnostic events" scrollLabel="Diagnostic timeline">
          <THead><Tr><Th numeric>Event</Th><Th>Trace</Th><Th>Stage</Th><Th>Outcome</Th><Th numeric>Duration</Th><Th>Classification</Th></Tr></THead>
          <TBody>{entries.map(({ sequence, event }) => <Tr key={sequence}>
            <Td numeric>{sequence}</Td><Td><Text size="sm">{event.operation}</Text><Text size="sm" tone="muted">{event.traceId.slice(0, 8)}</Text></Td>
            <Td>{event.stage}</Td><Td>{event.event === "started" ? "Started" : event.outcome}</Td>
            <Td numeric>{event.event === "finished" ? `${Math.round(event.durationMs)} ms` : "–"}</Td>
            <Td>{event.event === "finished" && event.outcome !== "success" ? <Flex direction="column" gap={2}>
              <Text size="sm">{event.failure.kind}{event.failure.contractRejected ? " · contract rejected" : ""}</Text>
              {event.failure.causes.length > 0 && <Text size="sm" tone="muted">Causes: {event.failure.causes.join(" → ")}</Text>}
            </Flex> : "–"}</Td>
          </Tr>)}</TBody>
        </Table></div>}
      <Text size="sm" tone="muted">{snapshot.entries.length} of {buffer.capacity} records retained · {snapshot.dropped} older records evicted. Clear or leave this page to discard the local history.</Text>
    </Flex></CardBody></Card>
  </Flex>;
}
