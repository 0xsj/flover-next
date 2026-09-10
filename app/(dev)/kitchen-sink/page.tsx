import Link from "next/link";
import { ArrowUpRight } from "@/components/utility";
import { Heading, SectionLabel, Text } from "@/components/typography";
import { CATALOG, CATALOG_GROUPS } from "./_lib/catalog";
import s from "./_components/sink.module.css";

export default function KitchenSinkPage() {
  return <>
    <div className={s.intro}>
      <SectionLabel>Flover / design system</SectionLabel>
      <Heading level={1} size="xl">A place for every piece.</Heading>
      <Text size="lg" tone="muted" measure>Explore the foundations, try the controls, and compose the patterns. Each category has its own examples, states, and source.</Text>
      <Text size="sm" tone="quiet">{CATALOG.length} categories · light & dark · comfortable & compact</Text>
    </div>
    {CATALOG_GROUPS.map((group) => <section key={group} className={s.catalogOverviewGroup} aria-label={group}>
      <Heading level={2} size="md">{group}</Heading>
      <div className={s.catalogCards}>{CATALOG.filter((entry) => entry.group === group).map((entry) =>
        <Link key={entry.id} href={`/kitchen-sink/${entry.id}`} className={s.catalogCard}>
          <div className={s.catalogCardTitle}>{entry.label}<ArrowUpRight size={16} aria-hidden="true" /></div>
          <Text tone="muted" size="sm">{entry.description}</Text>
        </Link>)}</div>
    </section>)}
  </>;
}
