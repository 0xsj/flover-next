# A composition root is handed its context, not reading it

The tier that knows every other tier does not have to be the one tier that
cannot leave the framework — hand it the token, the plan and the base url, and
only the call site stays runtime-specific.

## Origin

Building the tier that picks between a real transport and an in-memory one. The
project this was extracted from reads the session cookie inside that tier, which
makes it `async` and welds it to one runtime. The expectation was that this is
simply what a composition root is.

**Measured otherwise:** taking those three values as arguments left the tier
importing nothing framework-shaped, and it joined the set of directories that
copy verbatim into the sibling projects. The cost was one line per call site.

## What

    createRoot({ baseUrl?, token?, routes?, correlationId?, chaos? }) -> Root

Reading a cookie, a header or a query string happens in the **page**. The root
composes: it picks the adapter, threads the token and the correlation id into
it, wraps it for fault injection, and reports what it did.

    client          the composed transport
    correlationId   what every call through this root carries
    usingFixtures   transport-level provenance — fixture or server
    underChaos      whether a plan is in force

## Why the inversion is worth a line per call site

A composition root is conventionally the most coupled thing in a codebase,
because it is where the environment gets read. That coupling is not inherent —
it is a consequence of the root *fetching* its inputs rather than receiving
them. Invert it and three things follow.

It is **testable without a runtime**: construct one with literals and assert on
what it composed.

It is **portable**: the framework-specific part is the page, which was going to
be per-framework anyway.

And it becomes **honest about what it decides**. A root that reads its own inputs
hides the decision inside itself; a root that is handed them makes every call
site state which environment it is composing for.

## Its lifetime is one INTERACTION, not one request

The property that makes a correlation id worth carrying at all.

A page fanning out into four service calls should produce four failures naming
the same interaction — *what else happened when they clicked this*. Build a root
per request instead and the id degenerates into a second request id, and the
question it exists to answer becomes unanswerable again.

So the root holds the id, every client it composes shares it, and a caller may
pass one in to join an interaction already under way.

## Gotchas

**An empty fixture table is an answer, not a stub.** Where there is no domain
yet, every call should come back as *this fixture was never asked* rather than
as a not-found the caller could mistake for a real one. That distinction is only
available if the adapter refuses to invent a plausible failure.

**Resist a per-domain adapter list until domains exist.** Picking the transport
per domain is genuinely good — it lets a backend graduate one domain at a time —
and a union with no members is a modelled state nothing reaches. Add the
dimension with the first service.

**Fault injection composes here and nowhere else.** One place decides whether a
plan is in force, so one place can report it, and a surface under a plan can say
so. Scattered injection is indistinguishable from a bug.

**Transport provenance belongs here; domain provenance does not.** *Did this come
from a fixture or a server* is something the root alone knows. *Why should anyone
believe this value* is a property of a domain and does not belong on a transport.

## Used in

`flover-next` and its two sibling templates — the composition root, copied
between them unchanged.

## Related

[`fault-injection-is-a-decorator`](fault-injection-is-a-decorator.md),
[`portable-by-having-no-alias`](portable-by-having-no-alias.md).
