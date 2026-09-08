# Absence is a value, not a failure

A read whose emptiness is a legitimate answer should say so in its type, and the
kind that means *not there* should then be impossible for that read to produce.

## Origin

**Measured.** An error model routed every *not found* down the failure channel —
the same channel as "the server refused" and "the network died". A fixture with
no route registered came back as *looked and found nothing*, and the screen
reported an empty collection about a request that had never been asked.

## What

Three states, not two, and the type carries all three:

    Result<T, E>                       nobody looked · here it is
    Result<T | null, E minus notFound> nobody looked · looked, found nothing · here it is

A helper takes a result and a **required predicate** saying how this backend
signals legitimate absence. A recognised *not found* becomes a success carrying
null; an unrecognised one folds to the generic kind rather than passing through
under a type that promised it could not occur.

*Not found* then means only: **the resource should have been there and was not.**
A bad id, a route nobody serves.

## Why

The type does the work. Removing the kind from the failure union means a caller
**cannot** write a branch for a case that can no longer happen — the compiler
refuses it. That is stronger than a convention saying "check for null here".

The required predicate is the load-bearing part. Whether a 404 means *absent* or
means *wrong path* is a property of the backend, not of your error model, so
somebody has to say which. Making it optional would make guessing the default.

## Gotchas

**This is compensation, not an ideal.** If the api is yours to change, an
endpoint that returns success with an empty value for legitimate absence is
strictly better: it never conflates the two facts, and no predicate has to
recover which was meant. Reach for this when the backend is not yours.

**The permissive predicate should be named so it greps.** A predicate that
treats every *not found* as absence turns a typo in an endpoint path into a
confident empty state. It has uses; it should be embarrassing to type.

**A render-side counterpart is worth the extra type.** Collapsing to
`value ? … : "—"` at the last moment throws away the distinction the whole
mechanism just preserved.

## Used in

`flover-next` and the two sibling templates — reads whose emptiness is
meaningful.

## Related

[`failures-split-by-who-may-narrow`](failures-split-by-who-may-narrow.md).
