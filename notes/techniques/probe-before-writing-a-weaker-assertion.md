# Probe before writing a weaker assertion

An assertion written because you assumed the thing was unobservable is worse
than no test — it reports coverage it does not have, and the observability is
usually right there.

## Origin

**Measured, and nearly shipped.** Writing interaction tests for a modal, four
obligations to cover, and the fourth was a scroll lock. The reasoning went: a
test DOM has no viewport, so there is nothing to scroll, so this cannot be
observed — followed by an assertion that a boolean was a boolean, with a comment
explaining why it had to be weak.

Then a two-minute probe printing the body's attributes while the modal was open:
`data-scroll-locked`, and an inert `pointer-events`, both sitting there.

## What

When you are about to write a degraded assertion, write a throwaway probe first.
Not a test — a script that renders the thing and prints the state you assumed was
absent.

    render it · print the attributes · print the styles · print what changed

Ten lines, deleted afterwards. Either it confirms the assumption, and the
degraded test now has evidence behind it rather than a hunch — or it does not,
and the real assertion was available the whole time.

## Why the weak assertion is the worse outcome

A missing test is honest: nothing claims that behaviour is covered, and the gap
is countable. A test that cannot fail claims the opposite. It appears in the
count, it survives every refactor, and it is written with a comment explaining
its own weakness — which reads as diligence and is why nobody removes it.

The reasoning that produces it is also the confident kind. "A test DOM cannot see
that" sounds like knowledge of the environment rather than an assumption about
it, and it is not questioned in review because it sounds like the author checked.

## Gotchas

**A comment justifying a weak assertion is a smell, not a mitigation.** If it
were verified, the comment would cite the verification.

**Probe the real thing, not a simplified version.** The state you are looking for
is often set by a wrapper, a portal or a side effect that a minimal reproduction
does not exercise.

**If the probe confirms the gap, say WHICH obligation is unverified** and leave
no assertion at all. A named hole is a worklist; a passing test over the same
hole is a lie with a comment.

## Used in

`flover-next` and its two sibling templates — the modal group's interaction
tests, where the scroll lock nearly went untested.

## Related

[`negative-controls-catch-the-harness`](negative-controls-catch-the-harness.md)
— the same failure one level up, where the harness rather than the assertion is
the thing that cannot fail.
