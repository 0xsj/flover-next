import Link from "next/link";
import { PageHeader, CollectionToolbar } from "@/components/patterns";
import { Heading, Text, SectionLabel } from "@/components/typography";
import { Panel, Badge, DescriptionList, DescriptionItem, Stat } from "@/components/display";
import { Button } from "@/components/forms";
import { Case, Section } from "../_components/section";
import { readSources } from "../_lib/source";
import { TableDemo } from "./table-demo";
import s from "../_components/sink.module.css";

export async function PatternsSection() {
  return <Section id="patterns" title="Page patterns" blurb="A few common compositions built from the same primitives. Their slots carry content and controls; each application supplies its routing, state, and permissions.">
    <Case title="Page header" note="identity, context, and actions; the heading level is explicit" sources={await readSources(["patterns/page-header/page-header.tsx", "patterns/doc.ts"])}>
      <PageHeader level={3} leading={<SectionLabel>Workspace / overview</SectionLabel>} title="Northstar workspace"
        description="A shared place for projects, people, and the work between them."
        actions={<Button asChild intent="primary"><Link href="/kitchen-sink/tables">Explore projects</Link></Button>} />
      <PageHeader level={3} title="A quiet header" description="The same composition with only a title and supporting copy." />
    </Case>
    <Case title="Collection toolbar" note="controls, summary, and actions wrap independently">
      <CollectionToolbar summary="8 projects in this workspace" actions={<Button asChild size="sm"><Link href="/kitchen-sink/tables">Open table examples</Link></Button>}>
        <Text weight="strong">Workspace projects</Text><Badge glyph="●" tone="accent">All systems ready</Badge>
      </CollectionToolbar>
    </Case>
    <Case title="Collection page recipe" note="a header and toolbar around caller-owned table state">
      <PageHeader level={3} title="Projects" description="Browse the workspace, compare membership, and select projects across pages." />
      <TableDemo />
    </Case>
    <Case title="Detail page recipe" note="summary metrics beside structured record details">
      <PageHeader level={3} leading={<SectionLabel>Project / Atlas</SectionLabel>} title="Atlas" description="A detail view assembled from small, reusable pieces." actions={<Badge glyph="●" tone="accent">Active</Badge>} />
      <div className={s.statRow}><Stat label="Members" value={8} /><Stat label="Open tasks" value={0} hint="measured, none outstanding" /><Stat label="Storage" hint="not measured yet" /></div>
      <Panel title="Project details"><DescriptionList>
        <DescriptionItem term="Owner">Ada Lovelace</DescriptionItem>
        <DescriptionItem term="Visibility">Workspace members</DescriptionItem>
        <DescriptionItem term="Description"><Text>Shared infrastructure and tools for the next release.</Text></DescriptionItem>
      </DescriptionList></Panel>
      <Heading level={3} size="sm">Continue composing</Heading>
      <Text tone="muted">Forms supply editing, dialogs supply confirmation, and regional feedback explains a failed read. The screen decides which combination the task needs.</Text>
    </Case>
  </Section>;
}
