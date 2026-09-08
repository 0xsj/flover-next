# Negative controls catch the harness, not the code

A measuring harness needs one case that must fail and one that must pass, because
the failure it is most likely to have produces a beautiful uniform result.

## Origin

**Measured, twice in one sitting**, and both times the controls were the only
thing that noticed.

The first: a mutation run reported every mutant invalid — *including the control
that must die*. Cause had nothing to do with the mutations. Preserved evidence
had been added to the tree, it retained deliberate compile errors, and the
harness's typecheck gate was therefore failing on every run for a reason
unrelated to the code under test.

The second: after an unrelated edit, one mutation's target line no longer
existed, so it silently applied nothing and scored as neither killed nor
survived.

## What

Two extra cases in every scoring run:

    must-die       a change no non-vacuous suite could survive
    must-survive   an equivalent mutant — a comment reword, say

Assert both before reporting anything. If `must-die` survives, the suite is
vacuous or the harness never ran it. If `must-survive` dies, the harness is
reporting noise. If **both** come back the same as everything else, the harness
is broken and the ratio is fiction.

## Why

The failure mode this guards is not "the score is wrong". It is "the score is
uniform", and uniformity is exactly what a working harness looks like when the
code is good. A broken harness produces a clean 100% far more reliably than a
good suite does, and it produces it faster.

The direction that matters is the flattering one. A crash is visible. A harness
that scores every mutant as killed hands you a plausible, congratulatory,
completely wrong answer.

## Gotchas

**Distinguish "did not compile" from "was killed".** A non-zero exit is equally
consistent with a failing test, a build error, and a binary that does not exist —
and two of those three inflate the ratio. Typecheck first, and only run the suite
if the typecheck passed.

**Distinguish "was not applied" from either.** A mutation whose target string no
longer matches has measured nothing. Report it as its own outcome; folding it
into *invalid* is survivable, folding it into *killed* is not.

**Restore only the file being mutated, from content read at the moment of
mutation, in a `finally`.** Restoring a whole directory from a snapshot taken
earlier silently reverts every legitimate edit since — and then reports mutants
as survivors, because the tests that would have killed them were rolled back
first. The crash leaves the tree visibly broken; this one leaves it looking
clean.

**A survivor is not automatically a hole.** Check for an equivalent mutant first
— a change with no observable difference is correct and unkillable.

## Used in

`flover-next` — the mutation harness scoring two test suites.

## Related

[`baseline-before-you-improve`](baseline-before-you-improve.md).
