# Baseline before you improve

Score the artefact you already have, and record it, before building the one you
expect to be better — otherwise the comparison is available only as an opinion.

## Origin

Replacing a test suite written alongside an implementation with one written
behind an information barrier. The obvious move is to write the new suite and
report its score. **Measured instead:** the old suite first, against the same
mutants, with the number written to a file before the new suite existed.

Result: 6 of 10 mutants killed by the old suite, 9 of 10 by the new one, 10 of 10
by both together.

## What

Three steps, and the order is the whole technique:

  1. build the scoring harness
  2. run it against **what you already have**, and write the number down
  3. only then build the replacement

## Why

Without step 2 there is no denominator. "The new suite kills nine mutants" is
unfalsifiable praise — it is equally consistent with the old suite killing nine
too, or with the mutants being trivial.

It also protects the number from yourself. A baseline recorded before the
alternative exists cannot be quietly re-run with a friendlier mutant set when the
result disappoints, and everyone knows they could have.

The comparison is where the finding actually lives. The interesting output was
not the score — it was **which four** the old suite missed: an exact threshold
value, a status folding, a guard's second condition, and a fixture's failure
mode. Every one a boundary the implementation's own author had no reason to
doubt. That is a statement about how the two kinds of test differ, and only the
pairing produces it.

## Gotchas

**The union may beat both.** Here the old suite uniquely caught one the new one
missed, so keeping both was worth more than replacing one with the other. Framing
it as a replacement would have thrown that away.

**A baseline goes stale the moment you edit the subject.** One mutant later
targeted a line that a subsequent change rewrote, and silently scored
*not applied* — which the harness counted as neither killed nor survived. Re-run
the baseline after any edit to the code under test, and make an unapplied
mutation loud.

## Used in

`flover-next` — replacing an implementation-derived suite with a barriered one.

## Related

[`negative-controls-catch-the-harness`](negative-controls-catch-the-harness.md).
