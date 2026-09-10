"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Badge, Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle, Stat } from "@/components/display";
import { Alert } from "@/components/feedback";
import { Button, Checkbox, Field, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from "@/components/forms";
import { Flex } from "@/components/layout";
import { Text } from "@/components/typography";
import { createNoteExample, type SaveMode } from "@/lib/root/resilience";
import { createNoteModel, sameDraft } from "./note-model";
import s from "./resilience.module.css";

const SAVE_MODES: Array<{ value: SaveMode; label: string }> = [
  { value: "lost-response", label: "Commit, then lose the response" },
  { value: "not-delivered", label: "Request never reaches the server" },
  { value: "refused", label: "Server refuses the title" },
  { value: "success", label: "Save successfully" },
];

export function NoteDemo({ onReset }: { onReset: () => void }) {
  const [example] = useState(createNoteExample);
  const [model] = useState(() => createNoteModel(example, { title: "Launch checklist", body: "Review the recovery states before shipping." }));
  const [mode, setMode] = useState<SaveMode>("lost-response");
  const [failedChecks, setFailedChecks] = useState(false);
  const { draft, confirmed, phase } = useSyncExternalStore(model.subscribe, model.get, model.server);
  useEffect(() => () => model.cancel(), [model]);
  const busy = phase.state === "saving" || phase.state === "checking";
  const uncertain = phase.state === "unknown" || phase.state === "checking";
  const saved = phase.state === "ready" && confirmed !== null && sameDraft(draft, confirmed.draft);
  const fieldError = phase.state === "refused" && phase.failure.kind === "invalid" ? phase.failure.fields.title : undefined;
  const status = phase.state === "saving" ? "Saving the captured draft… You can keep editing."
    : phase.state === "checking" ? "Checking the existing operation. No new write is being sent."
      : phase.state === "unknown" ? "Save outcome unknown. Your draft is safe here; check the outcome before saving again."
        : phase.state === "refused" ? "Save refused. Your input has been preserved."
          : phase.state === "not-recorded" ? "No save was recorded. Your draft is ready for another attempt."
            : saved ? "Saved. The current draft matches the confirmed receipt."
              : confirmed ? "The earlier draft is saved. Your newer edits are still unsaved." : "This draft has not been saved.";

  return <Card aria-labelledby="note-title"><CardHeader actions={<Badge tone={uncertain ? "warn" : saved ? "accent" : "neutral"}>{uncertain ? "Outcome unknown" : saved ? "Saved" : "Draft"}</Badge>}>
    <CardTitle id="note-title" level={2}>Keep the draft. Check the save.</CardTitle>
    <CardDescription>A missing response does not tell you whether a write happened. Confirm its outcome before sending another.</CardDescription>
  </CardHeader><CardBody><div className={s.note}>
    <form onSubmit={event => { event.preventDefault(); void model.save(); }}><Flex direction="column" gap={5}>
      <Field label="Note title" required error={fieldError}>{control => <Input {...control} value={draft.title} onChange={event => model.edit({ ...draft, title: event.target.value })} />}</Field>
      <Field label="Note body" hint="Drafts stay on this page only. Reloading or resetting the example clears them.">{control => <Textarea {...control} rows={5} value={draft.body} onChange={event => model.edit({ ...draft, body: event.target.value })} />}</Field>
      <Flex gap={3} wrap>
        <Button type="submit" intent="primary" loading={phase.state === "saving"} disabled={busy || uncertain || saved}>Save note</Button>
        <Button loading={phase.state === "checking"} disabled={phase.state !== "unknown"} onClick={() => void model.check()}>Check save outcome</Button>
      </Flex>
      <Text size="sm" role="status" aria-atomic="true">{status}</Text>
      {phase.state === "unknown" && <Alert tone="warn" title="The outcome needs confirmation">{phase.failure.message} Checking reads the original save receipt and does not repeat the write.</Alert>}
      {phase.state === "refused" && <Alert tone="warn" title="The note was not saved">{phase.failure.message}</Alert>}
    </Flex></form>
    <Flex direction="column" gap={6} className={s.controls}>
      <Field label="Next save behavior">{control => <Select value={mode} onValueChange={value => {
        const selected = SAVE_MODES.find(option => option.value === value);
        if (selected) { setMode(selected.value); example.setSaveMode(selected.value); }
      }}><SelectTrigger {...control}><SelectValue /></SelectTrigger><SelectContent>
        {SAVE_MODES.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
      </SelectContent></Select>}</Field>
      <Field label="Make receipt checks fail" hint="The original operation stays unresolved until a check succeeds.">{control => <Checkbox {...control} checked={failedChecks} onCheckedChange={value => { setFailedChecks(value === true); example.failChecks(value === true); }} />}</Field>
      <div className={s.stats}>
        <Stat label="Simulated commits" value={example.committed()} hint="server-side changes in this example" />
        <Stat label="Confirmed revision" value={confirmed?.revision} hint="last receipt accepted by the client" />
      </div>
      {confirmed && <div className={s.receipt}><Text size="sm" weight="medium">Last confirmed note</Text><Text>{confirmed.draft.title}</Text><Text size="sm" tone="muted" className={s.noteBody}>{confirmed.draft.body || "Empty body"}</Text></div>}
    </Flex>
  </div></CardBody><CardFooter><Flex direction="column" gap={4}>
    <Text size="sm" tone="muted">This example server deduplicates operation IDs and gives a final answer about each save. A real backend must provide that contract too: “not found yet” is not enough to safely start another write.</Text>
    <div><Button size="sm" onClick={onReset}>Reset note example</Button></div>
  </Flex></CardFooter></Card>;
}
