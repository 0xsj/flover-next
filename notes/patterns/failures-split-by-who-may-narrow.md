# Failures split by who may narrow them

An error union should be cut in two — the kinds any call can produce, and the
kinds that vary by operation — because only the second half is a caller's to
declare away.

## Origin

**Measured.** A design let each operation declare "what this can fail with"
across the whole union. A read declaring *not found* was therefore implicitly
claiming it could never be rate-limited or cancelled, so both folded into a
generic internal error. Reproduced with a test: a rate limit carrying the
server's own retry-after came back generic, the retry policy computed *null*,
and a user's own cancellation rendered as "something went wrong".

## What

Two sets, named:

    TRANSPORT   any call can produce one — no credential, refused, rate
                limited, unreachable, timed out, cancelled, ours-or-nobody's
    DOMAIN      varies by operation — not found, invalid, conflict

A signature is *every transport kind* plus the domain kinds this operation
promises. Narrowing decides domain kinds only; a transport kind passes through
untouched, always. An unpromised domain kind folds to the generic kind carrying
the original as its cause.

## Why

Two properties fall out, and the first is the one that was bought with a bug.

**Retry survives.** A rate limit reaching a caller as a generic error has lost
the number the server sent, and no policy above can recover it.

**Cancellation survives.** A cancellation is an *answer* — somebody asked for
it — and rewriting it as an error means the UI apologises for doing what it was
told.

The split is also conservative in the right direction. Putting a kind in
TRANSPORT means no operation may claim it cannot happen; putting it in DOMAIN is
where a claim gets made. Defaulting to the safe half costs nothing.

And it is smaller. Declaring the promise becomes one line per operation, where
narrowing the whole union needed a hand-written switch per tier — the switch
being where the defect lived.

## Gotchas

**The naive mutation may not compile, which is a feature.** Deleting the
transport passthrough makes the folded value stop satisfying the declared return
type, so the compiler catches a careless edit before any test runs. Restoring
the fault needs a deliberate cast. Worth knowing before treating a mutation
score as the whole picture — part of this rule is enforced by types, not tests.

**The line between the halves is a judgement about YOUR api.** *Refused* is here
called transport because a permission check can fail on any call; a product
whose permissions are per-operation might place it the other way. Moving a name
between the two constant lists is the whole change.

## Used in

`flover-next` — the client failure model, and the two sibling templates it is
copied into verbatim.

## Related

[`value-inward-exception-at-the-edge`](value-inward-exception-at-the-edge.md),
[`absence-is-a-value-not-a-failure`](absence-is-a-value-not-a-failure.md).
