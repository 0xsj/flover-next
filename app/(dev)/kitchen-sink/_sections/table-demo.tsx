"use client";

import { useState } from "react";
import { Badge, Empty, Panel, Table, THead, TBody, TFoot, Tr, Th, Td, SortableTh } from "@/components/display";
import { Button, Checkbox, Input } from "@/components/forms";
import { Pagination } from "@/components/navigation";
import { CollectionToolbar } from "@/components/patterns";
import { Text } from "@/components/typography";

const PROJECTS = [
  { id: "atlas", name: "Atlas", owner: "Ada Lovelace", members: 8, active: true },
  { id: "beacon", name: "Beacon", owner: "Grace Hopper", members: 12, active: true },
  { id: "canvas", name: "Canvas", owner: "Alan Turing", members: 3, active: false },
  { id: "drift", name: "Drift", owner: "Margaret Hamilton", members: 0, active: true },
  { id: "echo", name: "Echo", owner: "Ada Lovelace", members: 6, active: true },
  { id: "folio", name: "Folio", owner: "Grace Hopper", members: 4, active: false },
  { id: "grove", name: "Grove", owner: "Alan Turing", members: 2, active: true },
  { id: "harbor", name: "Harbor", owner: "Margaret Hamilton", members: 9, active: true },
] as const;
const PAGE_SIZE = 4;
type Sort = { key: "name" | "members"; direction: "ascending" | "descending" };

export function TableDemo() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Sort>({ key: "name", direction: "ascending" });
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const filtered = PROJECTS.filter((project) => `${project.name} ${project.owner}`.toLowerCase().includes(query.toLowerCase().trim()));
  const ordered = [...filtered].sort((a, b) => {
    const comparison = sort.key === "name" ? a.name.localeCompare(b.name) : a.members - b.members;
    return sort.direction === "ascending" ? comparison : -comparison;
  });
  const visible = ordered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedOnPage = visible.filter((project) => selected.has(project.id)).length;
  function toggle(ids: readonly string[], checked: boolean) {
    setSelected((previous) => {
      const next = new Set(previous);
      for (const id of ids) { if (checked) next.add(id); else next.delete(id); }
      return next;
    });
  }
  function sortBy(key: Sort["key"]) {
    setSort({ key, direction: sort.key === key && sort.direction === "ascending" ? "descending" : "ascending" });
    setPage(1);
  }
  return <>
    <CollectionToolbar summary={<span role="status">{filtered.length} projects · {selected.size} selected</span>}
      actions={selected.size > 0 && <Button size="sm" intent="ghost" onClick={() => setSelected(new Set())}>Clear selection</Button>}>
      <Input type="search" aria-label="Search projects" placeholder="Search projects or owners…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
    </CollectionToolbar>
    <Panel flush>
      {filtered.length === 0 ? <Empty title="No matching projects" body="Try a different project name or owner." action={<Button size="sm" onClick={() => { setQuery(""); setPage(1); }}>Clear search</Button>} /> :
        <Table caption="Workspace projects · fixture data">
          <THead><Tr>
            <Th><Checkbox aria-label="Select projects on this page" checked={selectedOnPage === visible.length ? true : selectedOnPage > 0 ? "indeterminate" : false} onCheckedChange={(checked) => toggle(visible.map((project) => project.id), checked === true)} /></Th>
            <SortableTh direction={sort.key === "name" ? sort.direction : "none"} onSort={() => sortBy("name")}>Project</SortableTh>
            <Th>Owner</Th><Th>Status</Th>
            <SortableTh numeric direction={sort.key === "members" ? sort.direction : "none"} onSort={() => sortBy("members")}>Members</SortableTh>
          </Tr></THead>
          <TBody>{visible.map((project) => <Tr key={project.id} data-selected={selected.has(project.id) || undefined}>
            <Td><Checkbox aria-label={`Select ${project.name}`} checked={selected.has(project.id)} onCheckedChange={(checked) => toggle([project.id], checked === true)} /></Td>
            <Th scope="row">{project.name}</Th><Td>{project.owner}</Td>
            <Td><Badge glyph={project.active ? "●" : "Ⅱ"} tone={project.active ? "accent" : undefined}>{project.active ? "Active" : "Paused"}</Badge></Td>
            <Td numeric>{project.members}</Td>
          </Tr>)}</TBody>
          <TFoot><Tr><Th scope="row" colSpan={4}>Members on this page</Th><Td numeric>{visible.reduce((sum, project) => sum + project.members, 0)}</Td></Tr></TFoot>
        </Table>}
    </Panel>
    <CollectionToolbar summary={<Text size="sm" tone="muted">{filtered.length ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}` : "0 results"}</Text>}>
      <Pagination label="Project pages" page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} onPageChange={setPage} />
    </CollectionToolbar>
  </>;
}
