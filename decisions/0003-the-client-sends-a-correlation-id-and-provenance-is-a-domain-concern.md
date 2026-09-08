# 0003 — the client sends a correlation id it may not yet mint, and provenance is a domain concern that does not belong on a failure

**Status:** Accepted   ·   **Date:** 2026-09-09

Extends [`0002-a-failure-is-a-value-and-only-domain-kinds-are-narrowed`](0002-a-failure-is-a-value-and-only-domain-kinds-are-narrowed.md).
It does not supersede it; nothing here contradicts that record's body.

## Context

`lib/http` shipped sending exactly two headers — `content-type` and
`authorization` — and reading one id back: the server's `request_id`. So a
failure could name the single request that failed and nothing else.

The gap that matters: **a user action that fans out into several requests
produces several unrelatable failures.** Nobody can ask *"what happened when
they clicked Save?"* That is not recoverable after the fact; if the id was never
sent, no amount of log analysis reconstructs the grouping.

Four things were on the table and they are not the same thing:

- **request id** — one request/response pair. Server-minted. Already read.
- **correlation id** — everything caused by one originating action.
- **causation id** — the *immediate* parent, which turns a flat set into a tree.
- **provenance** — where a value came from, and why anyone should believe it.

The project this template was extracted from has a substantial provenance
implementation, and studying it is what settled this record. Its `Lineage` is a
**domain projection rooted at an observation** — observation to mapping version
to artifact bytes to the exact command to the rule that permitted the command.
Three disciplines carry it: every hop is *independently absent* (a missing link
is a fact, not an error); both timestamps are always present (`observed_at` is
when the tool ran, `recorded_at` when the row was written, and a client showing
only one cannot tell them apart); and the vocabulary says *a source said so*
rather than *this is true*.

None of that is transport metadata. It is the product.

## Decision

**Correlation and provenance are separate concerns with separate homes, and
conflating them is the failure this record exists to prevent.**

```
correlation   "what else happened when this happened?"   operational · transient · ours
provenance    "why do you believe this value?"           durable · the user's · domain
```

**The transport carries correlation.** `ClientConfig.getCorrelationId` is read
lazily on every request, exactly as the access token is, and `lib/http` sends it
as a header. `FailureMeta` gains `correlationId`, and both folds — `narrow` and
`optional` — preserve it alongside `type`, `requestId` and `status`.

**A failure can always name its interaction.** What the server echoes wins,
because the server saw the request; where the server ignores the header, the
client attaches what it sent. A failure that cannot name its own interaction is
exactly the failure you most want to trace.

**The seam ships and the originator does not.** Minting a per-interaction id
needs somewhere to hold *the current interaction*, which is `lib/runtime` and is
unbuilt. `getCorrelationId` is optional; returning `undefined` sends no header
and changes nothing.

**Header names live in `lib/http` as constants**, that being the only tier
permitted to name a header. Moving to `traceparent` is a one-line change there.

**Causation is not carried.** Within the client the `cause` chain already gives
it. Across services it is a span parent, which means committing to a tracing
scheme — a decision for the adopting product.

**Provenance is not modelled.** A template has no domain, and a lineage type
with no observation behind it is the modelled tier with no caller `CLAUDE.md`
warns about. What ships is the discipline, as notes.

## Alternatives

**W3C `traceparent`, client-originated.** The standard, and it carries
correlation *and* causation in one header every tracing backend already reads.
Rejected **for now, not on merit**: its format is a strict four-part string with
a span id per hop, which is a tracing library's job rather than something to
hand-mint, and the originator it needs does not exist here yet. The constant in
`lib/http` is the entire cost of changing to it later, and the failure model is
unaffected either way.

**Server-minted only — read, never send.** Keep what we had. Zero client state,
no forged ids, nothing to build. Rejected because it is the one option that
cannot be adopted later for work already done: requests that were never tagged
stay unrelatable forever.

**Carry the full trace context on every failure** — trace id, span id, parent
span. Rejected as coupling: the failure model would learn a tracing scheme, and
every constructor call site grows for a benefit only a tracing stack collects.

**Model provenance in the template.** Rejected on the strongest available
evidence — the source's own implementation is a *domain* projection whose every
hop is a domain entity. Reproducing its shape without its entities produces a
type nothing can populate.

**Put `usingFixtures` on `FailureMeta`.** Tempting, and wrong twice over: it is
a property of the *success* path as much as the failure path, and a screen
rendering fixture data needs to say so when nothing has failed at all. See
Consequences.

## Consequences

**The seam is inert until `lib/runtime` exists.** `getCorrelationId` ships with
no caller supplying it, so the header is absent in practice today. That is a
contract with an unbuilt originator, which is a weaker position than a working
feature and an honest one.

**A header is now a contract another party builds against.** A backend that
neither reads nor echoes `x-correlation-id` degrades gracefully — the client
attaches what it sent — but the grouping is only as good as the server's
willingness to log it.

**The fixture adapter had to change too.** A route can now see the id, and a
failure it returns gets the same attachment the network adapter performs. A
fixture whose failures carry no correlation is a fixture a screen can tell apart
from the server, which is the lie `protocols/fixtures.md` exists to prevent.

**The barriered spec suite predates this and does not cover it.** The 111 tests
in `lib/failure-model.spec.test.ts` were written from a contract with no
correlation in it. `lib/correlation.test.ts` is ordinary, implementation-derived
coverage, and this behaviour has never been through the barrier.

**One transport-level provenance fact is identified and NOT built:** which
adapter answered. `usingFixtures` exists in the worked example; making it a
first-class property of a successful read would change the success path's shape
and is a separate decision.

## Verification

- The header is sent on every request, is absent when the hook is absent or
  returns undefined, and is re-read per request so a new interaction is picked up
  without rebuilding the client. `lib/correlation.test.ts`.
- A failure carries what was sent when the server ignores the header, prefers the
  server's echo when there is one, and keeps it through a transport failure —
  the case where it matters most. Same file.
- The memory adapter shows a route the id, attaches it to a route's failure that
  set none, and to an unserved route. Same file.
- Both folds preserve it: `narrow` when folding an unpromised domain kind, and
  `optional` when folding an unrecognised `not_found`. Same file.
- Mutation: the suite as a whole still kills 10/10 with controls passing.
- **Not verified:** that `correlationId` is never branched on above `lib/http`.
  Same untested rule as `status` in `0002`, and now there are two of them.
- **Not verified:** that provenance stays out of `FailureMeta`. This is a review
  property — `protocols/spec-tests.md` says such a thing cannot be tested and to
  say so rather than approximate it.
