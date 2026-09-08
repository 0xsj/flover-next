# 0002 — a failure is a value, its kind is a client behaviour, and only the three domain kinds may be narrowed away

**Status:** Accepted   ·   **Date:** 2026-09-09

## Context

`lib/http` was the next tier to build, and it cannot be built without deciding
how a failure is represented. Three constraints applied at once:

- **The client has no server to transcribe.** The project this template was
  extracted from carries an error taxonomy that is a transcription of one Go
  backend's `pkg/errors.Kind`, in the order that file declares them. That
  property — the client never inventing categories — is what keeps it honest,
  and it is unavailable here. Whatever this template ships becomes a *proposal
  a backend must satisfy*, which is a contract another party builds against.
- **`CLAUDE.md` states that nothing above `lib/services` may name a URL, a
  status code or a header**, and that *nobody looked* and *looked and found
  nothing* are different facts.
- **The framework redacts errors.** An error thrown in a server component is
  replaced before a client boundary sees it in production; only a `digest`
  survives. Anything that must reach the client has to be data.

Three designs were built and run rather than argued about. They are recorded in
`Alternatives` with the defects that were **measured**, not imagined.

## Decision

**A failure is a value.** `Failure` is a discriminated union of plain objects
whose `kind` is the discriminant — not a class with a `kind` field. Per-kind
payloads are on their own variants (`fields` on `invalid`, `retryAfter` on
`rate_limited`), and `assertNever` in a `switch` default makes an added kind a
compile error at every call site.

**A kind is a client behaviour, not a server condition.** Ten of them. Two
server conditions that produce the same screen are one kind; a product's own
vocabulary rides in `type`, never as an eleventh kind. An unrecognised server
kind is preserved in `type` and normalised to `internal`, so the union stays
closed at runtime.

**The kinds split, and only one half may be narrowed.**

```
TRANSPORT   unauthenticated forbidden rate_limited unavailable timeout canceled internal
            — any call can produce one. No service may claim otherwise.
DOMAIN      not_found invalid conflict
            — varies by operation. The only set `narrow(...)` decides.
```

A service signature is `TransportFailure` plus the domain kinds that operation
promises. An unpromised domain kind folds to `internal` with the original as its
`cause`.

**The port returns `Result`**, so nothing below the React edge throws. `Result`
is a class — it never crosses a serialisation boundary — while `Failure` stays
plain data, because it crosses constantly.

**`not_found` is not the answer to "does this exist".** A read whose absence is
legitimate returns `Result<T | null, …>` through `optional`, which removes
`not_found` from the failure type. `optional` requires a predicate naming *how
the backend signals absence*; an unrecognised 404 folds to `internal` rather
than being reported as emptiness.

`lib/kernel` and `lib/http` are promoted. `lib/query`, `lib/root` and
`lib/services` remain unbuilt, and a worked example of all three lives in
`drafts/failure-model-example`, which the app does not import.

## Alternatives

**One class with optional fields** — what the extracted source does. Rejected on
two counts, both checkable. Every consumer null-checks data that cannot exist on
that kind, and nothing fails to compile when a kind is added. Measured on the
union instead: adding an eleventh kind stops three files compiling.

**A sealed class hierarchy** — ten subclasses, closest to Scala literally.
Rejected because instances do not survive the server/client boundary, which is
the *common* path once services return failures rather than throwing them. It
would reintroduce, as the normal case, the structural tag and `instanceof`
fallback the plain-object version removes. Verified by round-tripping a failure
through `JSON.parse(JSON.stringify(…))` unchanged.

**Services throw `AppError`; no `Result`.** Zero friction with the cache, error
boundaries and Server Actions, and no unwrap ceremony. Rejected because a throw
is invisible in a signature: the obligation to handle disappears. The cost of
the alternative is real and is recorded under Consequences.

**Narrowing over the whole union (the second draft).** Rejected on a **measured
defect**. Letting a service declare "what this operation can produce" across all
ten kinds meant a read declaring `not_found` implicitly claimed it could never
be rate-limited or cancelled — so both folded to `internal`. Reproduced with a
test: a 429 carrying `retry-after: 12` came back as `internal` and `retryDelay`
returned `null`, destroying the retry policy the same draft had just added; and
a user's own cancellation rendered as "something went wrong". The
transport/domain split exists because of this, and it also replaced a
fifteen-line switch per tier with one line.

**`optional` absorbing every 404 (the second draft).** Rejected on a measured
defect. With no fixture route registered, a read reported "looked and found
nothing" about a route that had never been asked — a fixture easier to satisfy
than the server, which is the precise lie `protocols/fixtures.md` exists to
prevent. Reproduced with a test.

**Thirteen kinds, transcribing the source's taxonomy.** Rejected: three of them
(`unprocessable`, `precondition_failed`, `precondition_required`) are HTTP
distinctions that land on the same two client branches as `invalid` and
`conflict`. They would arrive in a template with no caller and no server.

**Shipping the shape with an empty kind list.** The most honest option for a
template, and rejected because it costs a working memory adapter and a usable
`lib/http` until an adopting project decides — and the ten are defensible on
their own terms, being derived from client behaviour rather than inherited.

## Consequences

**TypeScript has no `?` and no do-notation.** Sequential composition where step
two needs step one's value is a chain of early returns, permanently. The
combinators cover mapping, collecting and folding; they do not fix this, and
pretending otherwise is how a `Result` port becomes unbearable.

**Narrowing is roughly one line per operation plus a named failure type per
tier.** Skip it and every signature is the full union, which is a coherent
choice and a weaker one.

**A rule exists that no type can enforce:** a `Result` must not be returned from
a Server Action or passed to a client component, because its methods do not
survive. This is a real cost of choosing a class, and it is mitigated rather
than eliminated — see Verification.

**Somebody must decide, per read, whether absence is an answer or a fault.**
Getting it wrong is now a visible type rather than an invisible shrug, which is
an improvement and is still work.

**`optional` is compensation, not an ideal.** Where the API is ours to change,
an endpoint returning `200` with `null` for legitimate absence is strictly
better and makes `optional` unnecessary. Shipping it risks it reading as the
recommended shape; `lib/kernel/doc.ts` says otherwise explicitly.

**`status` is carried on every failure and must never be branched on above
`lib/http`.** Nothing detects a violation. The extracted source states this rule
in a comment and breaks it in the function immediately below, which is the
evidence that a written rule is not enough.

**`lib/http` has no caller in the app yet.** It is a contract rather than a
modelled state, which `CLAUDE.md` permits — but the distinction is fine enough
to be worth naming rather than assuming.

## Verification

- **Exhaustiveness** — adding an eleventh kind stops the render switch, the
  envelope's payload assembly and the suite compiling. Measured by doing it.
- **Serialisability** — a failure round-trips through `JSON.stringify` unchanged.
  `lib/failure-model.test.ts`.
- **The split** — a 429 keeps its `retry-after` through a narrowed read, and a
  cancellation is never rewritten. `lib/failure-model.test.ts`, and the cache
  policy is asserted in `drafts/failure-model-example/usage.test.ts`.
- **Three states** — the three paths produce three distinct `Presence` states.
- **The boundary rule** — `lib/kernel/boundaries.test.ts` scans `app`, `lib`,
  `components` and `drafts` for a `"use server"` file returning a `Result`, and
  asserts it reads a non-zero number of files so it cannot pass vacuously. It
  **cannot** catch a `Result` reached through an alias or an inferred return
  type, or one nested inside another returned object; that is stated in the test.
- **`status` never branched on above `lib/http`** — **not verified.** No check
  exists. This is the weakest line in this record.
- **The suite is implementation-derived** and is labelled as such. By
  `protocols/spec-tests.md` it is a snapshot, not a specification. The barriered
  suite for these packages is owed under
  [`0001-spec-tests-start-at-business-logic`](0001-spec-tests-start-at-business-logic.md)
  and has not been written.
