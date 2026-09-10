"use client";

import { useState, useSyncExternalStore } from "react";
import { Card, CardBody, CardDescription, CardHeader, CardTitle, Empty, Table, TBody, Td, Th, THead, Tr } from "@/components/display";
import { Button, Field, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/forms";
import { Flex } from "@/components/layout";
import { Text } from "@/components/typography";
import type { createMemoryDiagnostics } from "@/lib/diagnostics";
import s from "./diagnostic-timeline.module.css";

/** Cookbook composition shared by the inspector and the complete item feature. */
export function DiagnosticTimeline({ buffer, pending = false }: { buffer: ReturnType<typeof createMemoryDiagnostics>; pending?: boolean }) {
  const [selected, setSelected] = useState("all");
  const snapshot = useSyncExternalStore(buffer.subscribe, buffer.get, buffer.server);
  const traces = [...new Map(snapshot.entries.map(({ event }) => [event.traceId, event])).values()];
  const selection = traces.some(trace => trace.traceId === selected) ? selected : "all";
  const entries = snapshot.entries.filter(entry => selection === "all" || entry.event.traceId === selection);
  const activeTrace = traces.find(trace => trace.traceId === selection);
  return <Card aria-labelledby="timeline-title"><CardHeader actions={<Button size="sm" disabled={pending || snapshot.entries.length === 0} onClick={() => { buffer.clear(); setSelected("all"); }}>Clear timeline</Button>}>
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
    </Flex></CardBody></Card>;
}
