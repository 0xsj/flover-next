# A backend graduates one domain at a time

*Is there a backend* and *is this domain finished* are two questions, and a
composition root that asks only the first makes the first endpoint to ship wait
for the last.

## Origin

Deferring per-domain adapter selection because there were no domains yet — a
union with no members being a modelled state with no caller. Three domains
later the deferral had expired, and the shape it wanted was already visible in
an older build of the same idea, which kept an explicit list of what the server
actually served and moved names into it as they landed.

## What

One flag is a deployment fact; the list is a readiness fact.

    baseUrl        is there a server at all
    served[]       which domains it answers TODAY

    clientFor(domain) -> the network when both are true, fixtures otherwise

So a screen written against an endpoint that does not exist keeps working, on
fixtures, until the day it does — and nothing above the root changes when it
lands. The migration is one name moving into a list.

## Two defaults that matter more than they look

**Omitting the list means ALL domains.** The alternative — defaulting to none —
makes a configured backend silently unused, which is a trap somebody meets at
the worst moment. The simple case should need one variable.

**An empty list is legal and means none**, which is a backend configured and
deliberately switched off. That is a different statement from having no backend,
and both are worth being able to make.

## Gotchas

**Every domain must still share one correlation id.** The split is about which
adapter answers, not about which interaction a call belongs to — and it would be
easy to build a client per domain and lose the thing the root exists for.

**Provenance becomes per-domain too.** *Did this come from a fixture* is now a
question with a different answer per domain, so a screen saying so has to ask
about the domain it actually read rather than about the application.

**The union names your domains, and that is fine.** It is a string union with no
imports, so the tier stays free of every service it is choosing an adapter for.

## Used in

`flover-next` and its two sibling templates — the composition root's per-domain
client, and the environment variable that narrows it.

## Related

[`a-root-is-handed-its-context`](a-root-is-handed-its-context.md),
[`a-service-takes-the-client`](a-service-takes-the-client.md).
