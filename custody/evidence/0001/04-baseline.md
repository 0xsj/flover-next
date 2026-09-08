# Baseline — the implementation-derived suite, scored on the same mutants

Recorded BEFORE the barriered suite was available, so the comparison cannot be
adjusted afterwards.

    subject   lib/failure-model.test.ts (30 tests, written alongside the code)
    result    6/10 killed · 4 survived · 0 invalid
    controls  must-die = killed · must-survive = SURVIVED → harness is measuring

    killed    M1 timeout-as-cancellation
              M2 unrecognised not_found reported as emptiness
              M3 narrow folds a transport failure
              M4 a member dropped from the retryable set
              M6 retryAfter read as ms rather than seconds
              M10 a non-JSON 2xx body reported as a transport fault
    survived  M5 the backoff cap moved 8s → 80s
              M7 an unserved fixture route answers not_found
              M8 isFailure stops requiring message to be a string
              M9 412 decodes as invalid rather than conflict

M1, M2 and M3 are the three faults that were real in an earlier build. The
snapshot suite catches all three — unsurprising, since it was written after they
were fixed and three of its assertions were added expressly to pin them.

## A finding that is not about either suite

M3 could not be expressed as a plain deletion. Removing the transport
passthrough from `narrow` **does not typecheck**: the folded value no longer
satisfies the declared return type. The mutation needs an explicit cast to
compile at all.

So rule 1 of §7 is **partly enforced by the type system**, not only by tests. A
careless edit is caught by `tsc` before any suite runs, and only a deliberate
cast can restore the fault. That is a stronger guarantee than a passing test and
it was not designed in — worth knowing before anyone treats the mutation score as
the whole picture.
