# A short circuit inherits what it skipped

Anything that answers instead of calling through takes on every obligation of
the path it bypassed — and the ones it forgets are invisible, because what it
returns still looks right.

## Origin

**Measured, and found by building a demonstration rather than by a test.** A
fault-injection wrapper sat above a transport and returned a manufactured
failure instead of calling it. The transport attaches the current interaction's
correlation id to every failure it produces; the wrapper never called it, so
nothing attached one.

The result was a failure with no interaction id — on exactly the path where
tracing matters most, and only on the failures somebody had deliberately asked
for. Twenty-odd tests over the wrapper passed throughout: every one asserted the
KIND it produced, and none asserted the metadata it should have carried.

## What

Whenever a layer can answer without delegating, enumerate what the delegated
path would have done to the answer, and do it too:

    identifiers      correlation, trace, request — attached deeper down
    auth context     who this was for
    timing, metrics  a call that never happened records nothing
    normalisation    defaults, coercions, shape guarantees

The rule reads as obvious and is missed constantly, because the short circuit is
written to be *simpler* than the real path — that is its whole point — and the
obligations are invisible from where it sits.

## Why the omission is silent

A short circuit returns a plausible value. It is the right type, the right
variant, and it renders. What is missing is the part nobody asserts on: a field
that is merely absent rather than wrong.

Absent fields do not fail tests written about behaviour. They fail months later,
when somebody follows a thread that stops.

## The fix that keeps working

**Make the obligation a parameter, not a lookup.** The wrapper could not read the
id — it had no access to the configuration the transport was built with — so it
now takes it. That turns a silent omission into a signature: every construction
site must supply one, and adding a second obligation later is a compile error at
each of them rather than a quiet gap.

Passing it also puts the decision where the knowledge is. The composition root
knows the interaction; the wrapper never should.

## Gotchas

**The obligation list grows without telling you.** It lives in the thing being
bypassed. Adding an enrichment to the real path silently leaves every short
circuit behind, and nothing connects the two edits.

**Assert the SHAPE, not just the outcome.** A test that checks the short circuit
produced the right kind will pass forever while the metadata rots. Compare
against what the real path produces.

**Caches have the same bug and nobody calls it one.** A hit returns without the
logging, metrics and header enrichment a miss performs, which is why request
volumes and traces disagree in exactly the systems that cache well.

## Used in

`flover-next` and its two sibling templates — the fault-injection wrapper over
the transport port.

## Related

[`fault-injection-is-a-decorator`](../patterns/fault-injection-is-a-decorator.md).
