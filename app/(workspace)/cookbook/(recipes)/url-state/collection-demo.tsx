"use client";

import { useRef, useState } from "react";
import { Badge, Card, CardBody, CardDescription, CardHeader, CardTitle, Empty, Table, TBody, Td, Th, THead, Tr } from "@/components/display";
import { Alert } from "@/components/feedback";
import { Button, Field, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/forms";
import { Flex } from "@/components/layout";
import { Pagination } from "@/components/navigation";
import { CollectionToolbar } from "@/components/patterns";
import { Text } from "@/components/typography";
import { useUrlState, type HistoryMode } from "@/lib/runtime/url-state";
import { collectionQuery, PAGE_SIZE, selectProjects, type CollectionState, type Project } from "./collection";
import s from "./collection.module.css";

function ProjectStatus({ status }: { status: Project["status"] }) {
  return <Badge tone={status === "active" ? "accent" : "neutral"}>{status}</Badge>;
}

export function CollectionDemo() {
  const url = useUrlState(collectionQuery);
  const state = url.value;
  const selected = selectProjects(state);
  const searchForm = useRef<HTMLFormElement>(null);
  const [feedback, setFeedback] = useState<{ path: string; message: string; failure?: boolean } | null>(null);
  const outside = selected.total > 0 && state.page > selected.totalPages;
  const notice = selected.total === 0 ? "No projects match these filters."
    : outside ? `Page ${state.page} has no results. This view has ${selected.totalPages} pages.`
      : `Showing ${(state.page - 1) * PAGE_SIZE + 1}–${Math.min(state.page * PAGE_SIZE, selected.total)} of ${selected.total} projects. Page ${state.page} of ${selected.totalPages}.`;

  function update(change: (current: CollectionState) => CollectionState, mode?: HistoryMode) {
    const result = url.update(change, mode);
    setFeedback(result.ok ? null : { path: url.path, message: result.error.message, failure: true });
  }
  function reset() { searchForm.current?.reset(); update(() => collectionQuery.defaults); }
  async function copy() {
    const path = url.path;
    try { await navigator.clipboard.writeText(window.location.href); setFeedback({ path, message: "Link copied. It includes this view’s current filters and page." }); }
    catch { setFeedback({ path, message: "The link could not be copied. Copy the address from your browser’s address bar.", failure: true }); }
  }

  return <Flex direction="column" gap={7}>
    <Alert tone="info" title="The address is the saved view">This collection uses public local samples. Submit a search or change a control, then try refreshing or using your browser’s back and forward buttons.</Alert>
    {url.issues.length > 0 && <Alert tone="warn" title="Some URL values could not be used" action={<Button size="sm" onClick={() => update(current => current, "replace")}>Use valid URL values</Button>}>
      <ul className={s.issues}>{url.issues.map(issue => <li key={issue.key}>{issue.message}</li>)}</ul>
    </Alert>}
    <Card><CardHeader actions={<Flex gap={3} wrap><Button size="sm" onClick={copy}>Copy view link</Button><Button size="sm" onClick={reset}>Reset view</Button></Flex>}>
      <CardTitle level={2}>Projects</CardTitle><CardDescription>Search by project or team. Filter and sort changes return to page one.</CardDescription>
    </CardHeader><CardBody><Flex direction="column" gap={6}>
      <CollectionToolbar>
        <form key={state.q} ref={searchForm} className={s.search} onSubmit={event => {
          event.preventDefault(); const q = String(new FormData(event.currentTarget).get("q") ?? "");
          update(current => ({ ...current, q, page: 1 }));
        }}><Field label="Search projects">{control => <Input {...control} name="q" defaultValue={state.q} maxLength={80} placeholder="Project or team" />}</Field><Button type="submit">Search</Button></form>
        <div className={s.choice}><Field label="Project status">{control => <Select value={state.status} onValueChange={value => {
          if (value === "all" || value === "active" || value === "paused" || value === "archived") update(current => ({ ...current, status: value, page: 1 }));
        }}><SelectTrigger {...control}><SelectValue /></SelectTrigger><SelectContent>
          <SelectItem value="all">All statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="paused">Paused</SelectItem><SelectItem value="archived">Archived</SelectItem>
        </SelectContent></Select>}</Field></div>
        <div className={s.choice}><Field label="Sort projects">{control => <Select value={state.sort} onValueChange={value => {
          if (value === "name" || value === "recent") update(current => ({ ...current, sort: value, page: 1 }));
        }}><SelectTrigger {...control}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="name">Name</SelectItem><SelectItem value="recent">Recently updated</SelectItem></SelectContent></Select>}</Field></div>
        <div className={s.choice}><Field label="Project view">{control => <Select value={state.view} onValueChange={value => {
          if (value === "table" || value === "cards") update(current => ({ ...current, view: value }));
        }}><SelectTrigger {...control}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="table">Table</SelectItem><SelectItem value="cards">Cards</SelectItem></SelectContent></Select>}</Field></div>
      </CollectionToolbar>
      <Text size="sm" tone="muted" role="status" aria-atomic="true">{notice}</Text>
      {selected.total === 0 ? <Empty title="No matching projects" body="Try another search or remove the status filter." action={<Button onClick={reset}>Show all projects</Button>} />
        : outside ? <Empty title="This page is outside the results" body={`The address requests page ${state.page}; these filters have ${selected.totalPages} pages.`} action={<Button onClick={() => update(current => ({ ...current, page: 1 }))}>Go to first page</Button>} />
          : state.view === "table" ? <Table caption="Projects matching this view" scrollLabel="Project collection"><THead><Tr><Th>Project</Th><Th>Team</Th><Th>Status</Th><Th>Updated</Th></Tr></THead>
            <TBody>{selected.rows.map(project => <Tr key={project.id}><Td>{project.name}</Td><Td>{project.owner}</Td><Td><ProjectStatus status={project.status} /></Td><Td><time dateTime={project.updated}>{project.updated}</time></Td></Tr>)}</TBody></Table>
            : <div className={s.cards}>{selected.rows.map(project => <Card key={project.id}><CardHeader actions={<ProjectStatus status={project.status} />}>
              <CardTitle level={3}>{project.name}</CardTitle><CardDescription>{project.owner}</CardDescription>
            </CardHeader><CardBody><Text size="sm" tone="muted">Updated <time dateTime={project.updated}>{project.updated}</time></Text></CardBody></Card>)}</div>}
      {!outside && <Pagination page={state.page} totalPages={selected.totalPages} onPageChange={page => update(current => ({ ...current, page }))} label="Project pages" />}
    </Flex></CardBody></Card>
    <Card><CardHeader><CardTitle level={2}>Current view address</CardTitle><CardDescription>Defaults are omitted when writing. Unrelated query parameters and the address fragment are preserved.</CardDescription></CardHeader><CardBody>
      <Text size="sm" className={s.address}>{url.path}</Text>
      <Text size="sm" role="status" aria-atomic="true" tone={feedback?.failure ? "danger" : "muted"}>{feedback?.path === url.path ? feedback.message : "Use Copy view link to share the full address, including any fragment."}</Text>
    </CardBody></Card>
  </Flex>;
}
