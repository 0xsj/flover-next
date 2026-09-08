# A value inward, an exception at the edge

Errors as values and a framework that demands throws are not in conflict, as
long as exactly one function converts and everybody knows which one.

## Origin

Porting a Result type into a codebase whose async cache marks a query failed by
a rejected promise, whose error boundaries need a real Error with a stack, and
whose form actions must return their failure rather than throw it.

## What

The domain returns a result. One function at the framework boundary unwraps it
and throws. One function on the way back recovers the value from whatever a
`catch` produced, **totally** — any input at all becomes a failure value, so the
same exhaustive branch works on both paths.

    domain      returns   Result<T, Failure>
    edge        throws    one unwrap, in front of the cache
    catch       recovers  one total conversion back to a value

Scala's shape: an ADT inward, an exception at the boundary.

## Why

The alternative is a throw in every service, which puts the obligation to handle
nowhere in any signature. The other alternative is a result all the way out,
which fights the framework at three separate places and loses.

What makes this cheap rather than a compromise is that there is **one** throw
site rather than one per service, and it is four lines. Everything below it is
free of invisible control flow, which is the property the whole design was for.

## Gotchas

**The error VALUE and the RESULT container have different portability
requirements, and conflating them costs you.** The failure crosses the
server/client boundary constantly — passed as props, returned from actions — so
it must be plain data with no prototype. The result never crosses it: the tier
that made one unwraps it. So the result may have methods and the failure may
not.

**That asymmetry creates a rule no type can enforce:** a result must not be
returned across a serialisation boundary, because its methods do not survive.
Give it a serialisation hook so an accidental crossing degrades to the plain
shape rather than to an empty object — and write a check, because a rule with no
check is a preference. See
[`portable-by-having-no-alias`](portable-by-having-no-alias.md) for the same
argument about a different rule.

**A form action is the case that justifies the whole thing.** Throwing sends the
failure to an error boundary, which replaces the form and loses what was typed.
Returning it is not merely tidier there; it is the only shape that works.

## Used in

`flover-next` and the two sibling templates — the client failure model.

## Related

[`failures-split-by-who-may-narrow`](failures-split-by-who-may-narrow.md),
[`no-question-mark-operator`](../language/no-question-mark-operator.md).
