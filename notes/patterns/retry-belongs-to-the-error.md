# Retry belongs to the error, not to the cache

Whether to try again, and how long to wait, is knowledge the failure already
has — a cache configured with `retry: 3` is guessing on behalf of a type that
could have told it.

## Origin

**Measured.** The project this was extracted from states the rule in a comment —
*read off the shared envelope rather than a status code, because nothing above
the transport is allowed to name one* — and the function immediately below that
comment compares `error.status` to 400 and 500.

The comment is right and the code is not, and both were written by the same
person in the same sitting. That is what a rule with no single definition does.

## What

The cache asks; the error model answers.

    retryDelay(failure, attempt) -> number | null

    null            an ANSWER, not a fault — a refusal, a validation failure,
                    a cancellation. Never retried, at any layer.
    a number        how long to wait: the server's own retry-after when it sent
                    one, exponential backoff otherwise, capped.

The cache's configuration becomes two lines that consult it and decide nothing:

    retry:      (attempt, error) => attempt < 2 && retryDelay(asFailure(error), attempt) !== null
    retryDelay: (attempt, error) => retryDelay(asFailure(error), attempt) ?? 0

## Why the default arrangement is wrong

Every cache library's documentation puts the policy in the cache, because that is
where the option lives. Three things follow from moving it out.

**A refusal stops being retried.** A generic `retry: 3` asks a server that said
*no* the same question twice more. Not-found, forbidden and invalid are answers;
retrying them turns one wall into three.

**A cancellation stops being retried.** Somebody pressed stop. Retrying is the
most user-hostile thing a client can do with that information.

**The server's own answer survives.** A rate limit carrying retry-after knows
better than any backoff curve, and a policy that lives in the cache has no way
to read it — the number is on the failure, and the cache was handed an `unknown`.

And the fourth, which is structural: the cache is above the transport, so a
policy written there either names a status code — breaking the tier rule — or
guesses without one.

## Rollback is the same question, and the wrong answer is worse

An optimistic write asks the mirror of it: *should this be undone?* — and the
answer is again in the kind, not in the fact of failure.

    every kind      put the row back
    not_found       do NOT. It was already gone, so the removal was RIGHT

A rollback that is wrong is worse than no rollback. It restores a row that no
longer exists and tells the reader their action failed **after** it had
succeeded — two false statements from one convenient `onError` that treated
every failure alike.

The general form: **whether to retry, whether to undo, and whether to offer the
reader a button are all policies the failure already knows.** A caller that
branches on *did it fail* rather than on *what kind of failure* is guessing at
each of them.

## Gotchas

**One definition, several callers.** The cache is not the only thing that
retries: a *try again* button, a background refresh and a queued write all ask
the same question. Each reimplementation is a chance to disagree.

**It only works if narrowing cannot destroy the answer.** A service tier that
folds a rate limit into a generic kind throws away the retry-after before the
cache ever sees it. The split between kinds any call can produce and kinds an
operation promises is what protects this.

**A write is a separate decision.** Never retry one automatically: the second
attempt may succeed against state the first one already changed. That is a fact
about writes, not about the failure, so it stays in the cache's configuration.

## Used in

`flover-next` and its two sibling templates — the async cache's defaults,
consulted by nothing else.

## Related

[`failures-split-by-who-may-narrow`](failures-split-by-who-may-narrow.md),
[`value-inward-exception-at-the-edge`](value-inward-exception-at-the-edge.md).
