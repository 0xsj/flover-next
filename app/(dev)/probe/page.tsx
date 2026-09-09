import Link from "next/link";
import { assertNever, err, forbidden, ok, presenceOf, type Failure } from "@/lib/kernel";
import { listItems, type Item } from "@/lib/services/example";
import type { MemoryRoute } from "@/lib/http";
import { parsePlan } from "@/lib/chaos";
import { createRoot } from "@/lib/root";
import s from "./probe.module.css";

/* A real screen, server-rendered, under a plan taken from the URL.
 *
 * The whole chain in one file: query string → plan → root → client → service →
 * three states. Nothing below the root knows chaos exists, and the service is
 * the same one-liner it would be in production. */

/** This screen's own fixtures. The shipped table is empty because a template has
 *  no domain; a caller with fixtures passes them in rather than editing the
 *  tier. Note it REFUSES as well as succeeding. */
const routes: MemoryRoute[] = [
  {
    method: "GET",
    pattern: /^\/items$/,
    handle: (req) =>
      req.params?.workspace === "locked"
        ? err(forbidden("Not your workspace.", { status: 403 }))
        : ok([
            { id: "i1", name: "api", host: "api.example.com" },
            { id: "i2", name: "www", host: "www.example.com" },
          ] satisfies Item[]),
  },
];

const PLANS = [
  ["", "no plan — the fixtures answer"],
  ["?chaos=GET /items=empty:list", "looked and found nothing"],
  ["?chaos=GET /items=fail:forbidden", "nobody looked"],
  ["?chaos=GET /items=fail:rate_limited", "and it keeps the retry-after"],
  ["?chaos=GET /items=latency:2000", "a slow server render"],
  ["?workspace=locked", "the fixture's own refusal, no chaos involved"],
] as const;

export default async function ProbePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams(
    Object.entries(params).flatMap(([k, v]) =>
      v === undefined ? [] : [[k, Array.isArray(v) ? (v[0] ?? "") : v] as [string, string]],
    ),
  );

  /* Reading the URL is the CALLER's job — that is what keeps lib/root free of a
     framework and portable to the siblings. */
  const root = createRoot({
    routes,
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    chaos: parsePlan(query),
  });

  /* An ordinary service call. It has no idea any of the above happened — and
     this screen never names an endpoint, which is the rule `lib/services`
     exists to hold. */
  const result = await listItems(root.clientFor("example"), query.get("workspace") ?? "w1");

  const presence = presenceOf(result.map((rows) => (rows.length ? rows : null)));

  return (
    <main className={s.page}>
      <div className={s.inner}>
        <div>
          <h1 className={s.title}>Probe</h1>
          <p className={s.blurb}>
            One server-rendered screen, reading its chaos plan from the query
            string. The service below is a one-line call that knows nothing
            about any of it.
          </p>
        </div>

        {/* A surface under a plan must SAY so. A forced failure that looks real
            is an afternoon somebody spends chasing it. */}
        <div className={s.badges}>
          {root.usingFixtures("example") ? <span className={`${s.badge} ${s.fixture}`}>fixtures</span> : null}
          {root.underChaos ? <span className={`${s.badge} ${s.chaos}`}>chaos</span> : null}
          <span className={`${s.badge} ${s.cid}`}>{root.correlationId}</span>
        </div>

        <div className={s.stage}>
          <span className={s.state}>{presence.state}</span>
          {presence.state === "found" ? (
            presence.value.map((t) => <span key={t.id} className={s.row}>{t.name}</span>)
          ) : presence.state === "empty" ? (
            <span className={s.quiet}>No targets yet.</span>
          ) : presence.state === "unmeasured" ? (
            <Problem failure={presence.failure} />
          ) : (
            assertNever(presence, "presence state")
          )}
        </div>

        <div className={s.links}>
          {PLANS.map(([q, note]) => (
            <Link key={q} href={`/probe${q}`} className={s.link}>
              {q || "/probe"} <span className={s.meta}>— {note}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

function Problem({ failure }: { failure: Failure }) {
  return (
    <>
      <span className={s.crit}>
        {failure.kind}
        {failure.kind === "rate_limited" && failure.retryAfter ? ` · retry after ${failure.retryAfter}s` : ""}
        {" — "}{failure.message}
      </span>
      {/* The thread back to everything else this interaction did. */}
      <span className={s.meta}>correlation {failure.correlationId ?? "—"}</span>
    </>
  );
}
