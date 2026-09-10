"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar, Badge, Card, CardBody, CardDescription, CardFooter, CardHeader, CardLink, CardTitle, DescriptionItem, DescriptionList, Empty } from "@/components/display";
import { Button, Fieldset, RadioGroup, Switch } from "@/components/forms";
import { Alert, Skeleton, SkeletonText } from "@/components/feedback";
import { SelectionCard } from "@/components/patterns";
import { Text } from "@/components/typography";
import { ArrowUpRight, Check } from "@/components/utility";
import s from "./card-demo.module.css";

export function RecordCardsDemo() {
  const [pinned, setPinned] = useState(false);
  return <div className={s.grid}>
    <Card aria-labelledby="atlas-card-title">
      <CardHeader leading={<Avatar name="Atlas workspace" />} actions={<Button size="sm" aria-pressed={pinned} onClick={() => setPinned(!pinned)}>{pinned ? <Check size={13} aria-hidden="true" /> : null}Pin Atlas</Button>}>
        <CardTitle id="atlas-card-title" level={3}><CardLink asChild><Link href="/kitchen-sink/patterns#detail-page-recipe">Atlas</Link></CardLink></CardTitle>
        <CardDescription>Shared tools for the next release.</CardDescription>
      </CardHeader>
      <CardBody><Badge className={s.badge} glyph="●" tone="accent">Active</Badge><DescriptionList><DescriptionItem term="Owner">Ada Lovelace</DescriptionItem><DescriptionItem term="Members">8 people</DescriptionItem><DescriptionItem term="Updated">10 September 2026</DescriptionItem></DescriptionList></CardBody>
      <CardFooter><Text size="sm" tone="muted" role="status">{pinned ? "Pinned to your workspace" : "Platform workspace"}</Text><ArrowUpRight size={15} aria-hidden="true" /></CardFooter>
    </Card>
    <Card aria-labelledby="seedling-card-title">
      <CardHeader leading={<Avatar name="Seedling workspace" />} actions={<Badge glyph="–" tone="neutral">Archived</Badge>}><CardTitle id="seedling-card-title" level={3}>Seedling</CardTitle><CardDescription>A finished exploration, kept for reference.</CardDescription></CardHeader>
      <CardBody><DescriptionList><DescriptionItem term="Owner">Grace Hopper</DescriptionItem><DescriptionItem term="Members">3 people</DescriptionItem></DescriptionList><Text size="sm" tone="muted" id="archive-reason">Archived workspaces are read-only.</Text></CardBody>
      <CardFooter><Text size="sm" tone="muted">Archived 2 September 2026</Text><Button size="sm" disabled aria-describedby="archive-reason">Edit workspace</Button></CardFooter>
    </Card>
  </div>;
}

export function SettingsCardsDemo() {
  const [digest, setDigest] = useState(true), [saved, setSaved] = useState(true);
  return <div className={s.grid}>
    <Card aria-labelledby="digest-card-title">
      <CardHeader actions={<Switch id="digest-switch" aria-labelledby="digest-card-title" aria-describedby="digest-card-description" checked={digest} onCheckedChange={setDigest} />}><CardTitle id="digest-card-title" level={3}><label htmlFor="digest-switch">Weekly digest</label></CardTitle><CardDescription id="digest-card-description">A summary of project activity and updates from your workspace.</CardDescription></CardHeader>
      <CardBody><Text size="sm" tone="muted">Delivery preference: Monday morning.</Text></CardBody>
      <CardFooter><Text size="sm" tone="muted" role="status">Saved preference: {saved ? "enabled" : "disabled"}</Text><Button size="sm" intent="primary" disabled={saved === digest} onClick={() => setSaved(digest)}>Save preference</Button></CardFooter>
    </Card>
    <Card aria-labelledby="audit-card-title"><CardHeader actions={<Switch id="audit-switch" aria-labelledby="audit-card-title" aria-describedby="audit-card-description" checked disabled />}><CardTitle id="audit-card-title" level={3}>Audit history</CardTitle><CardDescription id="audit-card-description">Required by this workspace. Only an administrator can change the policy.</CardDescription></CardHeader><CardBody><Badge className={s.badge} glyph="✓" tone="neutral">Managed by workspace</Badge></CardBody></Card>
  </div>;
}

export function SelectionCardsDemo() {
  const [layout, setLayout] = useState("board"), [features, setFeatures] = useState(["activity"]);
  const [submitted, setSubmitted] = useState<string | null>(null);
  return <form className={s.stack} onSubmit={(event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitted(`Layout: ${data.get("layout")}; sections: ${data.getAll("section").join(", ") || "none"}`);
  }} onReset={() => { setLayout("board"); setFeatures(["activity"]); setSubmitted(null); }}>
    <Fieldset legend="Choose a starting layout" hint="Select one option. Arrow keys move between available layouts.">
      <RadioGroup aria-label="Starting layout" name="layout" value={layout} onValueChange={setLayout} className={s.grid}>
        <SelectionCard mode="single" value="board" label="Board" description="Organize work by stage."><Text size="sm" tone="muted">Best for active projects</Text></SelectionCard>
        <SelectionCard mode="single" value="list" label="List" description="Scan and compare structured records."><Text size="sm" tone="muted">Best for shared collections</Text></SelectionCard>
        <SelectionCard mode="single" value="timeline" label="Timeline" description="Unavailable in this example." disabled><Text size="sm" tone="muted">Coming later</Text></SelectionCard>
      </RadioGroup>
    </Fieldset>
    <Fieldset legend="Add optional sections" hint="Choose any combination.">
      <div className={s.grid}>
        {[{ value: "activity", label: "Activity", description: "Recent changes and project updates." }, { value: "reports", label: "Reports", description: "Progress summaries and comparisons." }].map((item) => <SelectionCard key={item.value} mode="multiple" name="section" {...item} checked={features.includes(item.value)} onCheckedChange={(checked) => setFeatures((current) => checked ? [...current, item.value] : current.filter((value) => value !== item.value))} />)}
        <SelectionCard mode="multiple" name="section" value="automation" label="Automation" description="Unavailable in this example." disabled />
      </div>
    </Fieldset>
    <div className={s.actions}><Button intent="primary" type="submit">Use this configuration</Button><Button type="reset">Reset choices</Button></div>
    <Text size="sm" tone="muted" role="status">{submitted ?? `Current choice: ${layout}; ${features.length} optional ${features.length === 1 ? "section" : "sections"}.`}</Text>
  </form>;
}

export function CardStatesDemo() {
  const [state, setState] = useState<"failure" | "ready">("failure");
  return <div className={s.grid}>
    <Card aria-labelledby="loading-card-title" aria-busy="true"><CardHeader><CardTitle id="loading-card-title" level={3}>Loading workspace</CardTitle><CardDescription>Fetching the latest details…</CardDescription></CardHeader><CardBody><Skeleton width="45%" height="24px" /><SkeletonText lines={3} /></CardBody></Card>
    <Card aria-labelledby="empty-card-title"><CardHeader><CardTitle id="empty-card-title" level={3}>Saved views</CardTitle></CardHeader><CardBody><Empty title="No saved views yet" body="A saved view keeps the filters you return to." /></CardBody><CardFooter><Button asChild size="sm"><Link href="/kitchen-sink/tables">Explore a collection</Link></Button></CardFooter></Card>
    <Card aria-labelledby="failed-card-title"><CardHeader><CardTitle id="failed-card-title" level={3}>Workspace summary</CardTitle></CardHeader><CardBody>{state === "failure" ? <Alert tone="crit" title="Summary unavailable">We could not load the latest summary. Try again.</Alert> : <div role="status"><Badge glyph="✓" tone="accent">Summary refreshed</Badge><Text size="sm">8 members · 3 active projects</Text></div>}</CardBody><CardFooter><Button size="sm" onClick={() => setState(state === "failure" ? "ready" : "failure")}>{state === "failure" ? "Retry summary" : "Show failure again"}</Button></CardFooter></Card>
  </div>;
}
