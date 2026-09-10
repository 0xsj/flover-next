import Link from "next/link";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/display";
import { Alert } from "@/components/feedback";
import { Text } from "@/components/typography";
import { assertNever } from "@/lib/kernel";
import type { ManualBlock as Block } from "../_lib/types";
import s from "../manual.module.css";

export function ManualBlock({ block }: { block: Block }) {
  switch (block.kind) {
    case "text": return <Text className={s.paragraph}>{block.text}</Text>;
    case "list": return <ul className={s.list}>{block.items.map(item => <li key={item}>{item}</li>)}</ul>;
    case "code": return <figure className={s.example}><figcaption>{block.label}</figcaption><pre tabIndex={0} role="region" aria-label={block.label}><code>{block.code}</code></pre></figure>;
    case "callout": return <Alert tone="info" title={block.title}>{block.text}</Alert>;
    case "table": return <Table caption={block.caption} className={s.table}><THead><Tr>{block.headings.map(heading => <Th key={heading}>{heading}</Th>)}</Tr></THead><TBody>{block.rows.map((row, index) => <Tr key={index}>{row.map((value, column) => column === 0 ? <Th key={column} scope="row">{value}</Th> : <Td key={column}>{value}</Td>)}</Tr>)}</TBody></Table>;
    case "links": return <ul className={s.related}>{block.items.map(item => <li key={item.href}><Link href={item.href}>{item.label}</Link><Text size="sm" tone="muted">{item.description}</Text></li>)}</ul>;
    case "sources": return <div className={s.sources}><Text size="sm" weight="medium">Read in the repository</Text><ul>{block.items.map(item => <li key={item.path}><code>{item.path}</code><Text size="sm" tone="muted">{item.why}</Text></li>)}</ul></div>;
    default: return assertNever(block);
  }
}
