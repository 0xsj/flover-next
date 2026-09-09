# A service takes the client, and never imports one

The usual justification for handing a service its transport is testability; the
reason that actually pays is that it makes the whole tier byte-identical in three
frameworks.

## Origin

**Measured, and embarrassingly.** The rule *nothing above the service tier names
a URL* was written into this project's own instructions, the whole architecture
was built around it — and then two development screens called the transport by
path within a day. Both compiled. Both worked. Both looked reasonable in review.

The tier existed as prose and had no code in it, so there was nothing for a
screen to call and the shortest path was the wrong one.

## What

Five things a service does, and nothing else:

  1. names the endpoint — the only tier permitted to
  2. declares what it can fail with: every transport kind, plus the domain kinds
     this operation actually promises
  3. narrows, in one line, so a caller's switch is three cases and not ten
  4. says whether absence is an answer, for a read where it might be
  5. validates, where it can produce the same shape the server would

It takes the client first and **call options last** — a strict subset of the
transport's own options, carrying a cancellation signal and nothing else. It
does not fetch, cache, render, decide which implementation to use, or know that
a status code exists.

## The options parameter is not optional, whatever its type says

Omit it and cancellation becomes unreachable from every tier above. **Measured:**
the transport accepted a signal from the first commit, no service exposed one,
and a `canceled` kind was carefully defended at four tiers while no screen could
produce it. The defect is invisible in review because nothing is missing — every
signature reads fine on its own, and the gap only exists between them.

It must be a SUBSET of the transport's options, not the whole thing. Widen it and
a caller can set a path or a header, which hands back the endpoint the tier
exists to own.

And a composition must thread it into every call it makes. A signal honoured by
one of two parallel requests is a cancellation that half worked, which is worse
than one that did not work at all.

## Why portability is the better argument than mockability

Mockability is a real benefit and a weak argument, because it is satisfied by
half a dozen worse designs — a module-level singleton with a setter, a global
override in a test hook, an injected container.

The property none of those give you is that the tier **imports nothing that
differs between frameworks**. Once it takes the client and reads no ambient
context, one directory copies verbatim between a React project, a Svelte one and
a Solid one, and a `diff` between the repositories is a meaningful check that
they have not drifted. That is unavailable to any design where the service knows
how to obtain its own dependencies.

The moment a service imports a framework, a router or a client instance, it has
stopped being a service and become a binding.

## The failure type is aliased per tier, not spelled per function

    type ReadFailure  = TransportFailure | Fails<"not_found">
    type WriteFailure = TransportFailure | Fails<"invalid" | "conflict">

Spelled at each signature they drift, and **the drift is invisible**: two reads
promising slightly different sets is not a compile error anywhere. It surfaces
as two callers writing different switches for the same operation, months apart,
and neither of them wrong.

## Gotchas

**A broken boundary here compiles and works.** Nothing fails when a screen calls
the transport directly — the page renders, the data arrives. So this rule in
particular needs a check rather than a review habit, and the check is a
one-pattern scan over the tiers above.

**An empty list is a value, not a failure**, and it is not a not-found either.
A service that returns a failure for *nothing matched* has thrown away the
distinction the whole three-states discipline is for.

**A request no fixture serves must not look like a not-found.** Otherwise a test
asserting *this id does not exist* passes for the wrong reason, which happened
here while writing the tier's own tests. A fixture that wants a 404 registers one.

**Client-side validation should produce the SAME shape the server would.** Then a
form renders one branch rather than two, and moving a rule to the server later
changes nothing above the service.

## Used in

`flover-next` and its two sibling templates — one worked specimen directory,
which exists to be deleted when a real domain arrives.

## Related

[`a-root-is-handed-its-context`](a-root-is-handed-its-context.md),
[`failures-split-by-who-may-narrow`](failures-split-by-who-may-narrow.md),
[`portable-by-having-no-alias`](portable-by-having-no-alias.md).
