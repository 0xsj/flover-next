"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Badge, Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/display";
import { Alert } from "@/components/feedback";
import { Button } from "@/components/forms";
import { Flex } from "@/components/layout";
import { Text } from "@/components/typography";
import { createLatestRead, type ReadState } from "@/lib/runtime/latest-read";
import type { Item } from "@/lib/services/example";
import { createRaceExample, readResponseExample, type ResponseMode } from "@/lib/root/resilience";
import { createRaceModel } from "./race-model";
import { NoteDemo } from "./note-demo";
import s from "./resilience.module.css";

const RESPONSE_MODES: Array<{ mode: ResponseMode; label: string }> = [
  { mode: "valid", label: "Load valid data" },
  { mode: "malformed", label: "Wrong envelope" },
  { mode: "partial", label: "Malformed list item" },
  { mode: "unavailable", label: "Refresh failure" },
  { mode: "empty", label: "Empty list" },
];

function ReadResults({ state }: { state: ReadState<Item[]> }) {
  const data = state.state === "ready" ? state.value : state.state === "idle" ? undefined : state.previous;
  return <div className={s.result} aria-busy={state.state === "pending"}>
    {state.state === "failed" && <Alert tone="warn" title="This region could not be refreshed">{state.failure.message}</Alert>}
    {data === undefined ? <Text size="sm" tone="muted">{state.state === "pending" ? "Loading…" : "No successful read yet."}</Text>
      : data.length === 0 ? <Text size="sm">The request succeeded. No items were found.</Text>
        : <ul className={s.items}>{data.map(item => <li key={item.id}>
          <Text weight="medium">{item.name}</Text><Text size="sm" tone="muted">{item.host}</Text>
        </li>)}</ul>}
  </div>;
}

function ResponseDemo() {
  const [reader] = useState(() => createLatestRead(readResponseExample));
  const state = useSyncExternalStore(reader.subscribe, reader.get, reader.server);
  useEffect(() => () => reader.cancel(), [reader]);
  const stale = state.state === "failed" && state.previous !== undefined;
  const status = state.state === "idle" ? "Choose a response to begin."
    : state.state === "pending" ? "Requesting the next response…"
      : state.state === "failed" ? stale ? "Refresh failed. Previous data is still visible and may be stale." : "Request failed. No data has been accepted."
        : state.value.length ? "Valid response accepted." : "Valid empty response accepted.";
  return <Card aria-labelledby="response-title"><CardHeader actions={<Badge tone={stale ? "warn" : "neutral"}>{stale ? "Stale data" : "Response boundary"}</Badge>}>
    <CardTitle id="response-title" level={2}>Keep the last good view</CardTitle>
    <CardDescription>A malformed success cannot replace validated data. A real empty result can.</CardDescription>
  </CardHeader><CardBody><Flex direction="column" gap={5}>
    <ReadResults state={state} />
    <Text size="sm" tone="muted" role="status" aria-atomic="true">{status}</Text>
  </Flex></CardBody><CardFooter><Flex gap={3} wrap>
    {RESPONSE_MODES.map(({ mode, label }) => <Button key={mode} size="sm" intent={mode === "valid" ? "primary" : "secondary"} onClick={() => void reader.run(mode)}>{label}</Button>)}
  </Flex></CardFooter></Card>;
}

function RaceDemo() {
  const [model] = useState(() => createRaceModel(createRaceExample));
  const phase = useSyncExternalStore(model.phase.subscribe, model.phase.get, model.phase.server);
  const state = useSyncExternalStore(model.reader.subscribe, model.reader.get, model.reader.server);
  useEffect(() => () => model.cancel(), [model]);
  const status = phase === "idle" ? "Start the sequence to make two selections."
    : phase === "running" ? "The earlier response is held while the newer selection loads."
      : phase === "waiting" ? "Newer selection is visible. The earlier response is still held."
        : "Earlier response delivered. The newer selection remains visible.";
  return <Card aria-labelledby="race-title"><CardHeader actions={<Badge tone="neutral">Response order</Badge>}>
    <CardTitle id="race-title" level={2}>Let the latest selection win</CardTitle>
    <CardDescription>Two reads finish out of order. The older one even ignores cancellation.</CardDescription>
  </CardHeader><CardBody><Flex direction="column" gap={5}>
    <ol className={s.steps}>
      <li>Start an earlier read and hold its response.</li>
      <li>Make a newer selection and display its result.</li>
      <li>Release the older response without changing the view.</li>
    </ol>
    <ReadResults state={state} />
    <Text size="sm" tone="muted" role="status" aria-atomic="true">{status}</Text>
  </Flex></CardBody><CardFooter><Flex gap={3} wrap>
    <Button size="sm" intent="primary" disabled={phase === "running" || phase === "waiting"} onClick={() => void model.start()}>{phase === "complete" ? "Replay sequence" : "Start sequence"}</Button>
    <Button size="sm" disabled={phase !== "waiting"} onClick={() => void model.release()}>Release earlier response</Button>
  </Flex></CardFooter></Card>;
}

export function ResilienceDemo() {
  const [noteVersion, setNoteVersion] = useState(0);
  return <Flex direction="column" gap={7}>
    <Alert tone="info" title="A safe place to break things">These isolated simulations change no account data. Each sequence is controlled and repeatable.</Alert>
    <div className={s.examples}><ResponseDemo /><RaceDemo /></div>
    <NoteDemo key={noteVersion} onReset={() => setNoteVersion(version => version + 1)} />
  </Flex>;
}
