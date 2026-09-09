"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/forms";
import { asFailure, presenceOf, type Failure } from "@/lib/kernel";
import { parsePlan } from "@/lib/chaos";
import { Case, Row } from "../_components/section";
import { createRoot } from "@/lib/root";
import { listItems, type Item } from "@/lib/services/example";
import { routes } from "../_lib/demo";
import s from "../_components/sink.module.css";

/* Chaos is not a component, so it gets a HARNESS rather than a specimen.
 *
 * The only thing worth showing is the thing you cannot show any other way: that
 * a screen's four states are all reachable on demand. Each button sets a plan,
 * the demo below re-runs through a wrapped client, and what renders is the real
 * path — the same `presenceOf` a screen would use. */

const SCENARIOS = [
  { label: "found",       query: "",                                       note: "no plan — the fixture answers" },
  { label: "empty",       query: "chaos=GET /items=empty:list",             note: "a SUCCESS carrying nothing" },
  { label: "slow",        query: "chaos=GET /items=latency:1500",           note: "the loading state, held open" },
  { label: "forbidden",   query: "chaos=GET /items=fail:forbidden",         note: "nobody looked" },
  { label: "rate limited", query: "chaos=GET /items=fail:rate_limited",     note: "carries the server's retry-after" },
  { label: "hang",        query: "chaos=GET /items=hang",                   note: "never settles — the stuck spinner" },
  { label: "flaky",       query: "chaos=GET /items=fail:internal,p:0.5&chaosSeed=7", note: "seeded, so it replays" },
] as const;

type View =
  | { state: "loading" }
  | { state: "found"; rows: Item[] }
  | { state: "empty" }
  | { state: "unmeasured"; failure: Failure };

export function ChaosCase() {
  const [scenario, setScenario] = useState<(typeof SCENARIOS)[number]>(SCENARIOS[0]);
  const [answer, setAnswer] = useState<{ query: string; view: View } | null>(null);
  const abort = useRef<AbortController | null>(null);

  /* Loading is DERIVED, not set: it is simply "no answer for the plan we are
     currently showing". That removes a synchronous setState from the effect,
     and it makes a stale answer from a superseded scenario unrenderable rather
     than merely unlikely. */
  const view: View =
    answer && answer.query === scenario.query ? answer.view : { state: "loading" };

  useEffect(() => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    const query = scenario.query;

    void (async () => {
      /* The root composes the plan in; `listItems` is an ordinary service call
         that knows nothing about any of it. */
      const root = createRoot({ routes, chaos: parsePlan(query) });
      // The signal reaches the request, so `cancel` genuinely cancels it —
      // and a hung promise is released rather than leaked per click.
      const result = await listItems(root.clientFor("example"), "w1", { signal: controller.signal });
      if (controller.signal.aborted) return;

      const presence = presenceOf(result.map((r) => (r.length ? r : null)));
      setAnswer({
        query,
        view:
          presence.state === "found" ? { state: "found", rows: presence.value }
          : presence.state === "empty" ? { state: "empty" }
          : { state: "unmeasured", failure: asFailure(presence.failure) },
      });
    })();

    return () => controller.abort();
  }, [scenario]);

  const enabled = process.env.NODE_ENV !== "production";

  return (
    <>
      <Case title="Forcing a state" note="each button sets a plan and re-runs the same request">
        {!enabled ? (
          <p className={s.disabledNote}>
            <strong>Chaos is a no-op in this build.</strong> The wrapper returns
            the client untouched when <code>NODE_ENV</code> is production — the
            guard is structural, not a default, so reaching a live user takes a
            deliberate edit rather than a mis-set flag. Run the dev server to use
            this.
          </p>
        ) : null}

        <div className={s.scenarios}>
          {SCENARIOS.map((sc) => (
            <Button
              key={sc.label}
              size="sm"
              intent={sc === scenario ? "primary" : "secondary"}
              onClick={() => setScenario(sc)}
              disabled={!enabled}
            >
              {sc.label}
            </Button>
          ))}
          <Button size="sm" intent="ghost" onClick={() => { abort.current?.abort(); setAnswer(null); }} disabled={!enabled}>
            cancel
          </Button>
        </div>

        <div className={s.stage}>
          <div>
            <div className={s.stageState}>{view.state}</div>
            {view.state === "loading" ? <p className={s.quiet} aria-busy="true">Loading…</p> : null}
            {view.state === "empty" ? <p className={s.quiet}>No targets yet.</p> : null}
            {view.state === "unmeasured" ? (
              <p className={s.crit}>
                {view.failure.kind}
                {view.failure.kind === "rate_limited" && view.failure.retryAfter
                  ? ` · retry after ${view.failure.retryAfter}s` : ""}
                {" — "}{view.failure.message}
              </p>
            ) : null}
            {view.state === "found" ? (
              <div className={s.rows}>{view.rows.map((r) => <span key={r.id}>{r.name}</span>)}</div>
            ) : null}
          </div>
        </div>

        <Row label="plan">
          <code className={s.planLine}>{scenario.query ? `?${scenario.query}` : "— none —"}</code>
        </Row>
        <p className={s.limits}>{scenario.note}</p>
      </Case>

      <Case title="A chaos plan is a link" note="so a broken state is something you can send somebody">
        <p className={s.limits}>
          The plan lives in a query string, seeded, so a probabilistic run
          replays identically and a broken state is a URL rather than an
          instruction to edit a file. The parser is <strong>total and
          silent</strong>: a malformed plan is ignored rather than thrown,
          because an injector that can crash the page is indistinguishable from
          the bug being hunted.
        </p>
        <div className={s.rows}>
          {SCENARIOS.filter((sc) => sc.query).map((sc) => (
            <code key={sc.label} className={s.planLine}>?{sc.query}</code>
          ))}
        </div>
        <p className={s.limits}>
          <strong>hang is not a timeout.</strong> The wrapper sits above the
          transport, so nothing here can trip its time budget — hang is a promise
          that never settles, which is the stuck-spinner case. For the failure a
          real elapsed budget produces, ask for <code>fail:timeout</code> by
          name. It still honours cancellation: press <em>cancel</em> while
          hanging and the request resolves as <code>canceled</code>.
        </p>
      </Case>
    </>
  );
}
