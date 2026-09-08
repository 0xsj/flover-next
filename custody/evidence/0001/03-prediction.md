# Prediction — recorded BEFORE the suite was run

## Oracle tier

**Tier 3, and weaker than that in one respect.** The contract was authored by the
same person who wrote the implementation, on the same day, from that
implementation. `protocols/spec-tests.md` ranks a doc comment written after the
code third of four and says it "partly inherits its assumptions". This inherits
more than partly.

The two candidate documents that would have been richer were **disqualified**:
one carries 9 previous-measurement leaks and the other 4 — narratives naming
defects that were found and fixed, which is precisely the material that would
hand the writer the answers to the mutants below.

This run is therefore **not** a test of the barrier. It is a test of whether a
suite written from a stated contract catches faults that a suite written from
the implementation would have been blind to.

## Compile

The suite will not compile on the first attempt. The writer has no type checker.
Expected classes of error: wrong import specifiers, over-narrow generic
arguments on `ok`/`err`, and assuming `optional` is synchronous.

## Which assertions I expect to fail on correct code

None on correctness grounds. Two candidates on ambiguity:

- `retryDelay` exponential base — the contract says 250ms at attempt 0, doubling,
  capped at 8000. A writer could reasonably read "attempt" as 1-indexed.
- `all` on an empty array — the contract does not say. Genuinely ambiguous.

## The mutation score — the point of the run

Three faults are going to be restored. Each was real in an earlier build of this
code, each is stated as a requirement in the contract, and none is described in
the contract as ever having been broken.

| # | fault | stated in | prediction |
| --- | --- | --- | --- |
| M1 | a request exceeding its time budget is classified as a cancellation rather than a timeout | §12, "A failure with no response" | **50/50.** Catching it needs the writer to stub the global fetch, and it has no way to know that is possible. If it writes no transport tests at all this survives. |
| M2 | a `not_found` the predicate does not recognise becomes a success with a null value | §10, rule 4 | **killed.** Stated as a numbered rule with an explicit prohibition. |
| M3 | `narrow` folds a transport failure into `internal` instead of passing it through | §7, rule 1 | **killed.** Stated as rule 1 with the reason attached. |

Plus conventional mutants: drop a member from the retryable set, invert a guard,
move the backoff cap, and make `tapErr` return a new result.

**A survivor is a finding about the contract, not only about the suite.** If M1
survives, the contract failed to make transport classification testable, and the
sentence to add is a recommendation for the author — not something this run may
write and then measure itself against.
