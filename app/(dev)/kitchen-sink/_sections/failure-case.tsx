"use client";

import { useEffect, useState } from "react";
import {
  assertNever, chain, conflict, forbidden, internal, invalid, isTransport,
  notFound, rateLimited, timeout, unauthenticated, unavailable,
  type Failure, type TransportFailure,
} from "@/lib/kernel";
import { parsePlan } from "@/lib/chaos";
import { createRoot } from "@/lib/root";
import { getItem } from "@/lib/services/example";
import { Case, Row } from "../_components/section";
import { routes } from "../_lib/demo";
import s from "../_components/sink.module.css";

/* The two cases the sink was missing: what a failure IS by the time a component
 * sees it, and what a component does with it. */

/* ── 1 · the path ────────────────────────────────────────────────────────── */

const HOPS = [
  ["the wire", "a status and a body — the only place either is named"],
  ["envelope", "decodes to exactly one Failure. Total: a malformed body still produces one"],
  ["transport", "returns it as a VALUE. Nothing below the screen throws"],
  ["chaos", "may substitute one, in development only"],
  ["service", "narrows: transport kinds pass through, an unpromised domain kind folds to internal WITH the original as its cause"],
  ["screen", "switches. Transport surface once, its own domain kinds by name"],
] as const;

export function FailurePathCase() {
  const [seen, setSeen] = useState<Failure | null>(null);

  useEffect(() => {
    void (async () => {
      /* Force a `conflict` on a read. A read promises only `not_found`, so the
         service must fold it — and the fold is the interesting part. */
      const root = createRoot({
        routes,
        chaos: parsePlan("chaos=GET /items/i1=fail:conflict"),
      });
      const r = await getItem(root.clientFor("example"), "i1");
      if (!r.ok) setSeen(r.error);
    })();
  }, []);

  return (
    <Case title="How a failure travels" note="forced conflict on a read, and what the service does with it">
      <div className={s.hops}>
        {HOPS.map(([tier, what], i) => (
          <div key={tier} className={s.hop}>
            <span className={s.hopTier}>{i + 1}. {tier}</span>
            <span className={s.hopWhat}>{what}</span>
          </div>
        ))}
      </div>

      {seen ? (
        <>
          <Row label="screen sees">
            <code className={s.planLine}>
              {seen.kind}{seen.status ? ` · status ${seen.status}` : ""}
            </code>
          </Row>
          <Row label="cause chain">
            <code className={s.planLine}>{chain(seen).map((f) => f.kind).join("  ←  ")}</code>
          </Row>
          <Row label="correlation">
            <code className={s.planLine}>{seen.correlationId ?? "—"}</code>
          </Row>
          <p className={s.limits}>
            A read cannot produce <code>conflict</code>, so the service folded it
            to <code>internal</code> and kept the original as its cause —
            <strong> nothing was lost and the signature stayed true</strong>. The
            correlation id came from the composition root, so this failure names
            the interaction it belonged to even though no server was involved.
          </p>
        </>
      ) : (
        <p className={s.quiet}>…</p>
      )}
    </Case>
  );
}

/* ── 2 · what a component does with one ──────────────────────────────────── */

const SPECIMENS: Failure[] = [
  unauthenticated("Your session expired."),
  forbidden("You cannot see this workspace."),
  rateLimited("Too many requests.", 12),
  unavailable("The server could not be reached."),
  timeout("The server took too long."),
  { kind: "canceled", message: "You cancelled this." },
  internal("Something went wrong.", { requestId: "req_8f2a41" }),
  notFound("That item does not exist."),
  invalid("Check the form.", { name: "A name is required.", host: "Not a hostname." }),
  conflict("Somebody else edited this."),
];

/** The transport surface, written ONCE. Seven kinds, and every screen delegates
 *  to it — because any call can produce one and no service may narrow it away. */
function TransportProblem({ failure }: { failure: TransportFailure }) {
  switch (failure.kind) {
    case "unauthenticated": return <span className={s.warnText}>{failure.message} <a href="#">Sign in</a></span>;
    // Deliberately not a sign-in prompt: they ARE signed in, and offering one loops.
    case "forbidden": return <span className={s.crit}>{failure.message}</span>;
    case "rate_limited": return (
      <span className={s.warnText}>
        {failure.message}{failure.retryAfter ? ` Try again in ${failure.retryAfter}s.` : ""}
      </span>
    );
    case "unavailable":
    case "timeout": return <span className={s.warnText}>{failure.message} Usually temporary.</span>;
    // An answer, not a failure. They asked for it.
    case "canceled": return <span className={s.quiet}>— nothing rendered —</span>;
    case "internal": return (
      <span className={s.crit}>{failure.message} <code className={s.mono}>{failure.requestId}</code></span>
    );
    default: return assertNever(failure, "transport failure");
  }
}

export function FailureRenderingCase() {
  return (
    <Case title="Rendering a failure" note="the transport surface once; a screen adds only its own domain kinds">
      {SPECIMENS.map((f) => (
        <Row key={f.kind} label={f.kind}>
          {isTransport(f) ? (
            <TransportProblem failure={f} />
          ) : f.kind === "invalid" ? (
            // `fields` exists on THIS branch and nowhere else — no optional chaining.
            <span className={s.fieldList}>
              {Object.entries(f.fields).map(([k, v]) => (
                <span key={k}><code className={s.mono}>{k}</code> {v}</span>
              ))}
            </span>
          ) : f.kind === "not_found" ? (
            <span className={s.quiet}>{f.message}</span>
          ) : (
            <span className={s.warnText}>{f.message} Reload to see the current version.</span>
          )}
        </Row>
      ))}

      <p className={s.limits}>
        Ten kinds here because this is the unnarrowed boundary. A read promises
        one domain kind, so its switch is <strong>one case</strong> plus the
        shared transport surface; a create promises two. Writing{" "}
        <code>case &quot;invalid&quot;</code> on a read does not compile, and an
        eleventh kind stops every one of these switches compiling until it is
        handled — which is the point of a closed union.
      </p>
    </Case>
  );
}
