"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { asFailure, err, ok, presenceOf } from "@/lib/kernel";
import type { Item } from "@/lib/services/example";
import { parsePlan } from "@/lib/chaos";
import { createRoot, type Root } from "@/lib/root";
import { beginInteraction } from "@/lib/runtime";
import { useInteraction } from "@/lib/runtime/hooks";
import { defaultItemQuery, itemsQuery } from "@/lib/query";
import { Case, Row } from "../_components/section";
import { routes } from "../_lib/demo";
import s from "../_components/sink.module.css";

type Roots = { correlationId: string; plain: Root; broken: Root };

export function QueryCase() {
  /* An interaction begins ON MOUNT, never during render.
   *
   * Minting it in a `useState` initialiser was wrong twice: the server and the
   * client each ran it and produced different ids — a hydration mismatch — and
   * writing to a store during render is a side effect React may run twice.
   *
   * The store IS the external system here, so this SUBSCRIBES to it rather than
   * mirroring it into local state. The effect only tells the store to start;
   * nothing sets state inside it. On the server the store's snapshot is empty,
   * because nobody has clicked anything there. */
  const correlationId = useInteraction();

  useEffect(() => {
    if (!correlationId) beginInteraction();
  }, [correlationId]);

  const roots = useMemo<Roots | null>(
    () =>
      correlationId
        ? {
            correlationId,
            plain: createRoot({ routes, correlationId }),
            broken: createRoot({
              routes, correlationId,
              chaos: parsePlan("chaos=GET /items=fail:forbidden"),
            }),
          }
        : null,
    [correlationId],
  );

  return (
    <Case title="Through the cache" note="four states, and null is a value rather than an error">
      {roots ? <Reads roots={roots} /> : <p className={s.quiet}>Starting an interaction…</p>}

      <p className={s.limits}>
        <strong>All three reads name one interaction.</strong> An interaction is
        a user action — not a request, and not a component lifetime — so the id
        is minted once and handed to every root. Every failure these reads
        produce carries it, which is what makes <em>what else happened when they
        did this</em> answerable. It begins on mount rather than during render:
        the server has no interaction, and minting one there would be a
        different id on each side of hydration.
      </p>

      <p className={s.limits}>
        The cache hands every query an <code>AbortSignal</code> and aborts it
        when the query stops being wanted — an unmount, a key change, a refetch
        that supersedes. It is threaded into the service and down to the port,
        which is what makes <code>canceled</code> reachable at all.
      </p>
    </Case>
  );
}

/** The reads belong to the interaction, so they do not exist before it does. */
function Reads({ roots }: { roots: Roots }) {
  const list = useQuery(itemsQuery(roots.plain.client, "w1"));
  const empty = useQuery(defaultItemQuery(roots.plain.client, "w1"));
  const broken = useQuery({
    ...itemsQuery(roots.broken.client, "broken"),
    queryKey: ["example", "items", "broken"] as const,
    retry: false,
  });

  return (
    <>
      <Row label="list">
        {list.isPending ? <span className={s.quiet}>Loading…</span>
          : list.error ? <span className={s.crit}>{asFailure(list.error).kind}</span>
          : <span className={s.row}>{list.data.map((i) => i.name).join(" · ")}</span>}
      </Row>

      <Row label="optional read">
        {empty.isPending ? <span className={s.quiet}>Loading…</span>
          : <span className={s.quiet}>{presenceOf(
              empty.error ? err<Item | null>(asFailure(empty.error)) : ok<Item | null>(empty.data),
            ).state}</span>}
      </Row>

      <Row label="under chaos">
        {broken.isPending ? <span className={s.quiet}>Loading…</span>
          : broken.error ? <span className={s.crit}>{asFailure(broken.error).kind}</span>
          : <span className={s.row}>{broken.data.length} items</span>}
      </Row>

      <Row label="interaction">
        <code className={s.planLine}>{roots.correlationId}</code>
      </Row>
    </>
  );
}
