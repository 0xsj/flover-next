# 0001 — spec tests start at `lib/http`; a presentational component gets a spec-first doc and ordinary tests

**Status:** Accepted   ·   **Date:** 2026-09-08

## Context

[`protocols/spec-tests.md`](../protocols/spec-tests.md) is adopted. The question
of where to point it arose while writing the first component document,
`components/forms/button/doc.ts`, and it had to be answered before that file was
sealed — not after, because sealing is what the procedure is for.

What was true at the time:

- The build order in `CLAUDE.md` is styles, then components, then `lib/http` and
  `lib/root`. The presentation tier is what exists; the business tier does not.
- No test runner is installed. `package.json` has no test script and no DOM
  environment, so testing a React component at all is a stack row that has not
  been decided.
- The Button contract is 136 lines and its mutation set is roughly six: flip the
  `type` default, drop `data-disabled`, decouple `loading` from inert,
  synthesise a handler, swap the default `intent`, drop a variant from the map.
- Most of what a presentational component actually promises is CSS — contrast,
  layer order, focus indication, density — and none of it is reachable from a
  DOM assertion.
- The highest-value check that layer already has is the contrast audit in the
  kitchen sink. It parses the stylesheet at build time. It is not a test, and it
  found its answer without one.
- The procedure's own "free today, expensive later" claim is about the **oracle**,
  not the suite. A document written before an implementation cannot have been
  derived from it; a suite written later is not weakened by having waited.

That last point is what separates the two questions. They were being treated as
one.

## Decision

The spec-test procedure — sanitised oracle, barriered writer, triage, mutation
round, custody — is run against **business logic**, beginning with `lib/http`:
the port and its two adapters, where [`fixtures.md`](../protocols/fixtures.md)
requires the memory adapter to reproduce the server's refusals and not merely its
happy path. `lib/kernel/errors` and `lib/services` follow.

It is **not** run on presentational components. Components may have ordinary unit
and interaction tests, which are a different and much cheaper thing — no barrier,
no custody, no mutation round. The named exception at the component tier is
**overlays** — focus trap, escape, scroll lock, focus restored to the trigger —
which [`accessibility.md`](../protocols/accessibility.md) already requires
interaction tests for on its own account.

Every component still gets a `doc.ts` written **before** its implementation, in
two parts: a contract half that names no library and contains no code, and a
mechanics half below it. The oracle therefore exists at full strength for any
component the procedure is later pointed at, and sanitising that document is a
section cut rather than a per-paragraph judgement.

## Alternatives

**Run the full procedure on every component, starting with Button.** Lost on
arithmetic. The overhead — sanitising, a barriered agent, a mutation harness, a
custody entry — is roughly fixed per package, and it would be paid across the
whole design system against mutation sets of about six. It also aims the method
at the tier where defects are *least* likely to be invisible: a wrong border
radius is visible to its author, and the exception to that — accessibility — is
covered by a protocol that asks for interaction tests directly.

**Write component docs after the implementation, and skip the contract/mechanics
split.** Lost because it is the one thing here that cannot be recovered. A doc
written afterwards is a description, ranked third of four as an oracle and
explicitly "partly inherits its assumptions". The split costs minutes now and
buys the strongest available oracle tier for as long as the file exists.

**Skip spec tests entirely and write ordinary tests everywhere.** Lost at
`lib/http` specifically. A test derived from an implementation inherits that
implementation's bugs as expectations, and the memory adapter is the case where
that is expensive rather than merely imperfect: a fixture easier to satisfy than
the server produces screens built against a contract nobody serves, and the bill
arrives one domain at a time with no single change to blame.

**Start the procedure at `lib/kernel` instead.** Rejected for now on thinness
rather than principle. `kernel` today is `cn`, ten lines with no branch worth
mutating. When `errors.ts` lands it becomes a genuine target — a set-membership
classification, and "drop one member from a set" is a listed mutation — but it is
a second target, not a first.

## Consequences

**A component's document is checked by reading and by nothing else.** If a
`doc.ts` is wrong about its own component, no test will disagree with it. That is
the cost, and it is the exact capability the procedure exists to provide.

**The contract/mechanics split is discipline paid at every component for a
ceremony most of them will never receive.** If the procedure is never pointed at
a component, that structure was overhead. It is cheap overhead, and it is the
half of the bet that cannot be placed later.

**The method itself is unproven in this repository until `lib/http` exists.** Any
adjustment it needs — oracle format, barrier mechanics, how mutation is
automated — is discovered late, on the first package that matters rather than on
a cheap one.

**Components have no tests at all today, not merely no spec tests.** The test
runner row is still undecided, so "ordinary unit tests for components" is
permitted by this record and not yet possible.

**Overlays inherit a requirement before they are built.** Interaction tests for
them are now committed, which will force the test-runner row when the first
overlay lands rather than at a moment of choosing.

## Verification

**Not verified.** This is a scoping decision about where a procedure is applied,
and nothing in the tree detects a component that "should have had" spec tests.
That is a real weakness and not a formality.

Two checks *would* be mechanical and neither exists yet:

- every directory under `components/` contains a `doc.ts` — a document check of
  the kind [`enforcement.md`](../protocols/enforcement.md) describes
- the contract half of a component `doc.ts` contains no library name and no code
  fence — currently done by hand, with `grep` over the lines above the
  `§ MECHANICS` banner

Until those exist, this record is held by review, which
[`enforcement.md`](../protocols/enforcement.md) is explicit is one deadline away
from not being true.

## Sealing

**Not sealed, deliberately.** `decisions/verify.mjs` is present, so the
mechanism described in [`decisions.md`](../protocols/decisions.md) is available;
sealing is simply not being exercised yet.

    node decisions/verify.mjs                    read-only, exit 1 on any problem
    node decisions/verify.mjs --seal 0001-…      an Accepted record becomes immutable

The verifier therefore reports this record as `UNSEALED` and exits non-zero,
which is the correct reading: Accepted, editable, correction window open. That
window is the only period in which a mistake in this record can be fixed rather
than superseded, and leaving it open is a choice rather than an absence.
