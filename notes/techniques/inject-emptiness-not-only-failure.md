# Inject emptiness, not only failure

A fault injector that can only break things covers the half you would have found
anyway — the branches that ship unlooked-at are *empty* and *loading*.

## Origin

Building a way to exercise failure states, and noticing while listing them that
the failure states were not the problem. In development the fixtures always have
data, so the branch nobody had ever seen was the one that renders when there is
none.

## What

A screen has four states and the injector should reach all four:

    loading      latency, and a never-settling request for the stuck spinner
    empty        a SUCCESS carrying nothing — a null, or an empty collection
    unmeasured   any forced failure
    found        the only one anybody ever looks at

Forcing emptiness is a **success**, not a failure, and that is the whole point.
It is the state a three-states discipline exists for, and it is the one the
fixtures themselves conceal.

## Why the error states are the easy half

Errors get attention because they are frightening and because a stack trace
names them. An empty list has no stack trace. It renders as *nothing*, which
looks the same as a layout bug, a filter that matched nothing, and a request that
was never made — and the difference between those is exactly what a screen is
supposed to communicate.

The asymmetry compounds: a developer sees the error branch the first time
anything goes wrong, by accident. Nobody sees the empty branch by accident,
because the seed data has rows in it.

## Gotchas

**A probabilistic run that cannot be replayed is an anecdote.** Give the plan a
seed and assert that two runs with the same seed produce the same sequence —
otherwise "it fails sometimes" is where the investigation ends.

**Make the plan shareable.** Encoded in a query string, a broken state is a
LINK — *"send me the URL that shows it"*. Configured in code, it reproduces only
for the person who edited the file.

**The parser must be total and silent.** A malformed plan should be ignored, not
thrown. An injector that can itself crash the page is indistinguishable from the
bug being hunted, and it will be pasted into a URL by somebody guessing at the
syntax.

**A surface running under an injected plan must say so visibly.** A forced
failure that looks real is an afternoon somebody spends chasing it.

## Used in

`flover-next` and its two sibling templates — the four axes of the chaos plan.

## Related

[`fault-injection-is-a-decorator`](../patterns/fault-injection-is-a-decorator.md),
[`absence-is-a-value-not-a-failure`](../patterns/absence-is-a-value-not-a-failure.md).
