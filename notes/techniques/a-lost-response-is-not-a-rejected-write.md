# A lost response does not establish that a write was rejected.

A failure injector returning before the service calls through cannot test a
write that committed before its acknowledgement disappeared. Both can produce
the same timeout in the UI, while only one changed server state.

Keep the captured draft and operation identity until the outcome is resolved.
A receipt confirms that captured draft; it must not overwrite edits made while
the operation was pending. Reconciliation reads status rather than submitting
another write.

Absence also needs a contract. “No receipt yet” from a lagging index cannot mean
“this operation will never commit.” Unlocking a fresh operation on that answer
can duplicate the original change. A backend can offer a terminal status, or a
client can retain uncertainty; the frontend cannot invent certainty from a 404.

The resilience cookbook exercises both sides using an isolated memory server.
The sequence decorator loses the response only after the adapter succeeds.
Moving that failure before call-through was one of the curated mutations caught
by the ordinary tests. That measurement says the distinction is tested, not
that an arbitrary backend implements the required receipt contract.
