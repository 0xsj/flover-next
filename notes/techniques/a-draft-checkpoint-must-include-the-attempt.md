Persisting an editable draft is insufficient recovery when a write may already have committed.

## Origin

Extending a visit-local note example into a reloadable item editor exposed two
different facts: what the person is typing now, and what was sent earlier.
Keeping only the first loses the identity needed to reconcile the second.

## Why

A draft can change while a response is pending. Recovery needs the operation id,
the exact submitted values, and the concurrency token captured at submission.
Those must be checkpointed before the request starts. If checkpointing fails,
the write cannot safely proceed under a policy promising reload recovery.

A receipt updates the confirmed baseline. It does not replace newer input.
If storing that confirmation fails, the server success remains a success; the
older unresolved checkpoint can still recover by looking up the same receipt.
These are separate outcomes, so one success/error flag cannot represent them.

## Limits

The server must deduplicate operation ids and expose authoritative outcomes.
An eventually consistent missing receipt cannot establish that nothing committed.
Browser storage is also fallible; a visible checkpoint failure is a reason to
keep or copy the current input, not a claim of durable recovery.

## Used in

Editors that permit continued typing during saves and restore their state after
navigation or reload, including the shared draft lifecycle and item cookbook.

## Related

- [A lost response is not a rejected write](a-lost-response-is-not-a-rejected-write.md)
