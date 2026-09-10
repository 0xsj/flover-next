"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Badge, Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/display";
import { Alert, Progress } from "@/components/feedback";
import { Button } from "@/components/forms";
import { Flex } from "@/components/layout";
import { Text } from "@/components/typography";
import { createJobExample, type CancelMode } from "@/lib/root/jobs";
import { createJobObserver } from "@/lib/runtime/job-observer";
import { terminalJob, type Job } from "@/lib/services/jobs";
import { ScenarioChoice } from "../_components/scenario-choice";
import s from "../_components/recipe.module.css";

export function JobsDemo() {
  const [kind, setKind] = useState<Job["kind"]>("export"), [version, setVersion] = useState(0);
  return <><Flex gap={4} wrap><ScenarioChoice label="Example job" value={kind} options={[{ value: "export", label: "Export records" }, { value: "import", label: "Import records" }]} onChange={setKind} /><Button onClick={() => setVersion(value => value + 1)}>Reset job simulation</Button></Flex><JobDemo key={`${kind}:${version}`} kind={kind} /><Text size="sm" tone="muted">Frontend: treat events as refresh hints, reject stale snapshots, and keep cancellation separate from observation. Backend: authorize job ownership, persist status and revisions, and report cancellation truthfully. This recipe observes a pre-existing simulated job; starting jobs and delivering files remain product-specific adapter work. Resetting or leaving clears this in-memory simulation.</Text></>;
}
function JobDemo({ kind }: { kind: Job["kind"] }) {
  const [root] = useState(() => createJobExample(kind));
  const [model] = useState(() => createJobObserver(root.id, root));
  const state = useSyncExternalStore(model.subscribe, model.get, model.server);
  const [connected, setConnected] = useState(true), [mode, setMode] = useState<CancelMode>("accept");
  useEffect(() => { const unsubscribe = root.subscribe(() => { void model.hint(); }); void model.start(); return () => { unsubscribe(); model.dispose(); }; }, [model, root]);
  const job = state.job, terminal = job && terminalJob(job);
  return <div className={s.columns}><Card><CardHeader actions={<Badge tone={job?.state === "failed" ? "warn" : "neutral"}>{job?.state ?? "Loading"}</Badge>}><CardTitle level={2}>{kind === "export" ? "Records export" : "Records import"}</CardTitle><CardDescription>Job {root.id}. {job ? `Last accepted revision: ${job.revision}.` : "Reading the first snapshot."}</CardDescription></CardHeader><CardBody><Flex direction="column" gap={5}>
    {job?.state === "queued" && <Text>Queued. No progress has been measured.</Text>}
    {job?.state === "running" && <><Progress label="Job progress" value={job.progress} /><Text>{job.progress === null ? "Running · progress has not been measured" : `${job.progress}% measured progress`}</Text></>}
    {job?.state === "completed" && <Alert tone="accent" title="Job completed">{job.summary}</Alert>}
    {job?.state === "failed" && <Alert tone="warn" title="Job failed">{job.reason}</Alert>}
    {job?.state === "canceled" && <Alert tone="info" title="Cancellation confirmed">The server reports that this job was canceled.</Alert>}
    <Text size="sm" role="status">{!state.watching ? "Observation stopped. The job may still be running." : state.refreshing ? "Reading the current job state…" : !connected || state.failure ? "The last accepted snapshot may be out of date." : "Watching for job changes."}</Text>
    {state.failure && <Alert tone="warn" title="Job refresh failed">{state.failure.message}</Alert>}
    <Flex wrap gap={3}><Button onClick={() => { if (state.watching) model.stop(); else void model.start(); }}>{state.watching ? "Stop watching" : "Resume watching"}</Button><Button disabled={!state.watching || state.refreshing} onClick={() => void model.refresh()}>Refresh job</Button><Button intent="danger" disabled={!job || !!terminal || state.cancellation !== "idle"} onClick={() => void model.cancel()}>Request cancellation</Button></Flex>
    {state.cancellation !== "idle" && <Alert tone="info" title="Cancellation request">{state.cancellation === "pending" ? "Waiting for an acknowledgment." : state.cancellation === "accepted" ? "Request accepted. Keep watching for the final job state; completion may still win the race." : state.cancellation === "too-late" ? "The job finished before cancellation could be accepted." : "The request outcome is unknown. Refresh status; do not assume the job stopped."}{state.cancelFailure && ` ${state.cancelFailure.message}`}</Alert>}
  </Flex></CardBody></Card><Card><CardHeader><CardTitle level={2}>Advance the simulated server</CardTitle><CardDescription>Each step changes the job independently of whether this page is watching. Events prompt a fresh read.</CardDescription></CardHeader><CardBody><Flex direction="column" gap={5}>
    <Flex wrap gap={3}><Button onClick={() => root.advance()}>Advance server job</Button><Button onClick={() => root.fail()}>Fail server job</Button><Button onClick={() => { const next = !connected; setConnected(next); root.connect(next); if (!next) void model.refresh(); }}>{connected ? "Disconnect" : "Reconnect"}</Button></Flex>
    <ScenarioChoice label="Cancellation behavior" value={mode} options={[{ value: "accept", label: "Accept, then stop on next server step" }, { value: "lost-response", label: "Accept, but lose the acknowledgment" }, { value: "complete-first", label: "Completion wins the race" }]} onChange={value => { setMode(value); root.setCancelMode(value); }} />
    <Text size="sm" tone="muted">Queued → running with unknown progress → measured progress → completed. An accepted cancellation takes effect on the next server step.</Text>
  </Flex></CardBody></Card></div>;
}
