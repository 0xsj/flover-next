"use client";

import { useQuery } from "@tanstack/react-query";
import { assertNever, asFailure, err, ok, presenceOf } from "@/lib/kernel";
import { clientFor } from "../root";
import { primaryTargetQuery, targetsQuery } from "../query/queries";
import type { Target } from "../services/targets";
import { Notice, Problem } from "./problem";

/* The client side, and the payoff: the SAME problem components the server
 * screens use.
 *
 * The cache rejects with an AppError; `asFailure` turns it back into the value
 * the rest of the system speaks. One vocabulary, both paths. */

export function TargetsList({ workspace }: { workspace: string }) {
  const client = clientFor("session-token");
  const { data, error, isPending, refetch, isFetching } = useQuery(
    targetsQuery(client, workspace),
  );

  // FOUR states, and they are genuinely different things.
  if (isPending) return <p aria-busy="true">Loading…</p>;
  if (error) return <Problem failure={asFailure(error)} />;
  if (data.length === 0) return <Notice tone="quiet">No targets yet.</Notice>;

  return (
    <>
      <ul>{data.map((t) => <li key={t.id}>{t.name} — {t.host}</li>)}</ul>
      <button onClick={() => void refetch()} disabled={isFetching}>
        {isFetching ? "Refreshing…" : "Refresh"}
      </button>
    </>
  );
}

/** Three states through the cache. `null` is a legitimate VALUE here, so
 *  "looked and found nothing" never touches the error branch — which is the
 *  whole reason `optional` exists. */
export function PrimaryTargetCard({ workspace }: { workspace: string }) {
  const { data, error, isPending } = useQuery(
    primaryTargetQuery(clientFor("session-token"), workspace),
  );

  if (isPending) return <p aria-busy="true">Loading…</p>;

  /* Rebuild a Result from the cache's two channels — `data` is `Target | null`,
     so `null` is a value and never an error. No cast: `ok` and `err` are the
     same constructors the service tier uses. */
  const presence = presenceOf(
    error ? err<Target | null>(asFailure(error)) : ok<Target | null>(data),
  );

  switch (presence.state) {
    case "found":      return <p>Primary: {presence.value.name}</p>;
    case "empty":      return <p>No primary target has been chosen.</p>;
    case "unmeasured": return <Problem failure={presence.failure} />;
    default:           return assertNever(presence, "presence state");
  }
}
