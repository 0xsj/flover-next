# Aborting by hand makes every timeout look like a cancellation

`AbortSignal.timeout` raises a `TimeoutError`; aborting a controller yourself
raises an `AbortError`, which is the same thing a caller's own cancellation
raises — so a hand-rolled timeout is indistinguishable from a user pressing
cancel.

**True of the WHATWG fetch/AbortSignal behaviour as implemented in Node 24 and
current browsers · verified 2026-09-09**

## Origin

**Measured.** A transport client set a timer, called `controller.abort()` when it
fired, and classified the resulting error by name. Every timeout was therefore
classified as a cancellation — and since a cancellation is deliberately *not*
retryable (somebody asked for it), no request that timed out was ever retried.

The client's own `TimeoutError` branch was dead code that could not fire.
Reproduced with a stubbed fetch, a promise that never settles, and a 5 ms budget.

## What

    AbortSignal.timeout(ms)      → aborts with DOMException named "TimeoutError"
    controller.abort()           → aborts with DOMException named "AbortError"
    caller cancelling            → also "AbortError"

Use the first for a deadline, and combine it with the caller's signal rather than
replacing it:

    AbortSignal.any([AbortSignal.timeout(ms), callersSignal])

Then the two causes stay distinguishable at the catch, which is what lets a
timeout be retryable and a cancellation not.

## Why the defect is quiet

Nothing errors. Requests still fail, still surface a message, still look
plausible. What is missing is a retry that should have happened, which nobody
notices because the alternative — a request that succeeds on the second attempt —
was never observed either. It presents as "the network is flaky", months later.

## Gotchas

**Match on `name`, not `instanceof DOMException`.** Under a test DOM the global
`DOMException` is the test environment's while `fetch` throws the runtime's, so
the instance check silently fails and everything falls through to the default
branch. Also measured.

**`AbortSignal.timeout` starts its timer immediately and there is nothing to
clear.** The hand-rolled version had a `clearTimeout` in a `finally`; this one
leaves the timer to expire. In Node it does not hold the event loop open, so it
is harmless — but it is a real difference, not just tidier code.

**`AbortSignal.any` is the part with the shortest history.** If a target runtime
predates it, combining signals is the piece to check first.

## Used in

`flover-next` and its two sibling templates — the network transport adapter.

## Primary source

The WHATWG DOM standard's `AbortSignal.timeout()` and `AbortSignal.any()`
definitions, and the abort reason each produces. Re-check the abort-reason names
on a major runtime upgrade; the classification depends entirely on them.
