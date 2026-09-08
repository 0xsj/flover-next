# A thrown error does not survive the server/client boundary

An error thrown in a server component is redacted before a client error boundary
sees it in production — the message is replaced and only a digest survives — so
anything the client must actually know has to travel as data.

**True of Next 16.3.4, App Router, production builds · read, not measured here**

## Origin

Deciding whether a client's error type should be a class or a plain value. The
class version looked fine until this: a class instance does not survive
serialisation, *and* the framework does not even attempt to pass the error
through.

**Read, not measured.** No test in this repository demonstrates the redaction —
it is production-build behaviour and the surrounding design was chosen to avoid
depending on it either way. The design consequence below was verified: a plain
value round-trips through serialisation unchanged.

## What

Two separate losses, and conflating them leads to the wrong fix:

    identity     a class instance arrives as a plain object — no prototype,
                 so `instanceof` fails
    content      in production the message is REPLACED with a generic one and
                 a `digest` is attached; in development the real one shows

The second is the one that surprises people, because development looks correct.

## Why it decides a design rather than merely inconveniencing one

If failures must reach the client — to render a specific surface, to fill in
per-field form errors, to name a retry — then throwing and catching at a boundary
cannot be the mechanism. The failure has to be **returned as data** and passed
down as props, or returned from a form action.

That makes it a constraint on the error type itself: it must be a plain value.
The alternative is a structural tag plus a hand-written `instanceof` fallback,
which is compensating for a choice rather than making one.

## Gotchas

**Development lies.** The real message shows in dev, so a design that depends on
reading it looks correct until it is deployed.

**A digest is not useless — it is a server log key.** Discarding it loses the one
thread back to what actually happened.

**This is separate from "class instances do not serialise".** Even a plain object
thrown from a server component is subject to the redaction; passing it as a value
is what avoids the path entirely.

## Used in

`flover-next` — the reason the client's failure type is a plain discriminated
union rather than a class hierarchy.

## Primary source

The Next.js App Router documentation on error handling, and its description of
what a production error boundary receives. Re-check on a major upgrade; this is
framework policy rather than a platform guarantee.
