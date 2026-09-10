"use client";

import { useState } from "react";
import { Badge, Empty, Panel, Table, TBody, Td, Th, THead, Tr } from "@/components/display";
import { Alert, Skeleton } from "@/components/feedback";
import { Button } from "@/components/forms";
import { Flex } from "@/components/layout";
import { asFailure, isRetryable } from "@/lib/kernel";
import { useActivity } from "@/lib/query";
import type { AuditEntry } from "@/lib/services/ledger";
import { useBrowserRoot } from "@/app/_lib/browser-root";
import s from "./page.module.css";

/* An append-only log, a page at a time, over the cache.
 *
 * The read this template exists to demonstrate: cursor-paged, filterable,
 * legitimately empty, and carrying a correlation id per row — which is the
 * column that makes `decisions/0003` worth anything. Every entry here was
 * actually recorded by the fixture as a side effect of an operation somebody
 * performed, so signing in adds a row and revoking a session adds another.
 *
 * # There is no total, and that is deliberate
 *
 * Counting an append-only ledger is a full scan whose answer is stale before it
 * renders. `CLAUDE.md`: an unmeasured total renders as `–`, never as a number
 * nothing computed. So no "1–50 of 1,284", and no page numbers — the ledger
 * grows at the HEAD, so an offset would re-show rows that moved down and hide
 * the ones that took their place. */

const RELATIVE = (iso: string): string => {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const TONE: Record<string, "accent" | "warn" | "crit" | undefined> = {
  system: "warn",
  account: "accent",
};

export function ActivityTable() {
  const client = useBrowserRoot().clientFor("ledger");
  const [facet, setFacet] = useState<string | undefined>();
  const [correlation, setCorrelation] = useState<string | undefined>();

  const query = useActivity(client, { facet, correlation });

  const pages = query.data?.pages ?? [];
  const entries = pages.flatMap((page) => page.entries);
  /* Page ONE only, and kept as the filter changes. The server sends facets with
     the first page because they describe the whole set — absent on later pages
     means "keep the ones you have", never "there are none". */
  const facets = pages[0]?.facets ?? [];
  const failure = query.error ? asFailure(query.error) : null;

  return (
    <Panel title="Activity">
      <Flex direction="column" gap={6}>
        <Flex gap={3} wrap>
          <button
            type="button"
            className={s.chip}
            data-on={!facet && !correlation || undefined}
            onClick={() => { setFacet(undefined); setCorrelation(undefined); }}
          >
            everything
          </button>
          {facets.map(({ facet: name, total }) => (
            <button
              key={name}
              type="button"
              className={s.chip}
              data-on={facet === name || undefined}
              onClick={() => { setFacet(name); setCorrelation(undefined); }}
            >
              {name}
              {/* AS GIVEN. Recomputing this from the visible rows would show
                  every other bucket as zero once a facet is entered, and remove
                  the way back out of it. */}
              <span className={s.count}>{total}</span>
            </button>
          ))}
          {correlation ? (
            <button type="button" className={s.chip} data-on onClick={() => setCorrelation(undefined)}>
              interaction {correlation.slice(0, 12)} ✕
            </button>
          ) : null}
        </Flex>

        {query.isPending ? (
          <Flex direction="column" gap={4}>
            {[0, 1, 2, 3, 4].map((n) => <Skeleton key={n} height="18px" />)}
          </Flex>
        ) : failure ? (
          /* NOBODY LOOKED. Never an empty table — a refused read rendered as
             emptiness is the collapse the three states exist to prevent. */
          <Alert tone="crit" title={failure.message}>
            <Flex direction="column" gap={4}>
              <span className={s.meta}>
                Nobody looked, which is not the same as finding nothing.
                {failure.correlationId ? ` Reference ${failure.correlationId}.` : null}
              </span>
              {isRetryable(failure) ? (
                <div><Button size="sm" onClick={() => void query.refetch()}>Try again</Button></div>
              ) : null}
            </Flex>
          </Alert>
        ) : entries.length === 0 ? (
          /* LOOKED AND FOUND NOTHING. A 200 with no rows — an unknown facet or
             a correlation with nothing else in it, and both are answers. */
          <Empty
            title="Nothing here"
            body={
              correlation
                ? "No other entry belongs to that interaction."
                : facet
                  ? `No ${facet} activity yet.`
                  : "Nothing has happened on this account yet."
            }
          />
        ) : (
          <>
            <div className={s.scroll}>
              <Table caption="Everything recorded on this account, newest first">
                <THead>
                  <Tr>
                    <Th>when</Th><Th>action</Th><Th>subject</Th>
                    <Th>actor</Th><Th>scope</Th><Th>interaction</Th>
                  </Tr>
                </THead>
                <TBody>
                  {entries.map((entry) => (
                    <Row
                      key={entry.id}
                      entry={entry}
                      onCorrelation={() => { setCorrelation(entry.correlation_id); setFacet(undefined); }}
                    />
                  ))}
                </TBody>
              </Table>
            </div>

            <Flex gap={5} align="center" wrap>
              {/* The presence of a cursor is the whole answer. No count is kept
                  and none is needed. */}
              {query.hasNextPage ? (
                <Button
                  size="sm"
                  loading={query.isFetchingNextPage}
                  onClick={() => void query.fetchNextPage()}
                >
                  Load more
                </Button>
              ) : (
                <span className={s.meta}>That is the whole log.</span>
              )}
              <span className={s.meta}>
                {entries.length} shown of <span title="unmeasured">–</span> — no total is
                computed, because counting an append-only log is a full scan
                whose answer is stale before it renders.
              </span>
            </Flex>
          </>
        )}
      </Flex>
    </Panel>
  );
}

function Row({ entry, onCorrelation }: { entry: AuditEntry; onCorrelation: () => void }) {
  const detail = Object.entries(entry.detail);
  return (
    <Tr>
      <Td><span className={s.meta} title={entry.occurred_at}>{RELATIVE(entry.occurred_at)}</span></Td>
      <Td>
        <span className={s.action}>{entry.action}</span>
        {detail.length ? (
          <div className={s.detail}>
            {detail.map(([k, v]) => `${k}: ${String(v)}`).join(" · ")}
          </div>
        ) : null}
      </Td>
      <Td><span className={s.mono}>{entry.subject}</span></Td>
      <Td>
        {/* `anonymous` is a real value and means the request arrived
            unauthenticated. Rendered as words, never blank, and never the
            account it went on to create. */}
        {entry.actor === "anonymous"
          ? <span className={s.anon}>not signed in</span>
          : <span className={s.mono}>{entry.actor}</span>}
      </Td>
      <Td><Badge tone={TONE[entry.scope]}>{entry.scope}</Badge></Td>
      <Td>
        <button type="button" className={s.corr} onClick={onCorrelation} title="Everything else in this interaction">
          {entry.correlation_id.slice(0, 12)}
        </button>
      </Td>
    </Tr>
  );
}
