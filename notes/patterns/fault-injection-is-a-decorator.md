# Fault injection is a decorator when the port returns values

A transport that returns failures instead of throwing them makes breaking things
a wrapper around the port — no patched global, no interceptor, and nothing above
it can tell.

## Origin

Wanting to see how screens handle failures, in a client whose transport port
returns a result rather than throwing. The expected cost was an interceptor: a
patched fetch, or a flag threaded through the client. **Measured:** it was a
decorator with the same interface, and every tier above was untouched.

## What

    withChaos(client, plan) -> client

Same interface in, same interface out. For a matching request the wrapper returns
a failure, or an empty success, or waits, instead of calling through. Services,
screens and the cache are unchanged because the type they depend on is unchanged.

It wraps either adapter — the real transport or the in-memory one — because both
satisfy the same port.

## Why it is this cheap

Because failure is already a *value*. In a design that throws, injecting a fault
means arranging for something to be thrown from inside a call somebody else
makes, which is why the usual answer is patching a global. Here it is a return
statement.

The port was built for swapping a real transport for a fixture. Fault injection
is the same seam used a third time, and it needed no new one.

## Gotchas

**A wrapper sits ABOVE the transport, so it cannot trip the transport's own
timers.** "Never settle" is a promise that never resolves — the stuck-spinner
case, a screen with no deadline of its own. It is NOT the transport's time budget
elapsing, and conflating the two produces a test that quietly exercises the wrong
path. Force the timeout FAILURE by name instead.

**A hang must still honour cancellation**, or it is a leak rather than a test.

**Failures arrive unnarrowed, and that is the feature.** Because the wrapper is
above the transport and below the service, a forced kind an operation does not
promise gets folded by that operation's own narrowing, carrying the original as
its cause. You are watching the real path rather than a simulation of it.

**Keep it out of the fixtures.** A fixture reproduces what the server DOES;
injection forces what it COULD. Collapsing them turns "a fixture must reproduce
refusals" into "a fixture returns whatever is convenient", and the fixture
discipline is worth more than the convenience. So the wrapper never edits a route
table.

**Make it structurally impossible in production**, not off by default. Returning
the client untouched when the build is a production one means reaching a live
user takes a deliberate edit rather than a mis-set flag.

## Used in

`flover-next` and its two sibling templates — a chaos wrapper over the transport
port.

## Related

[`inject-emptiness-not-only-failure`](../techniques/inject-emptiness-not-only-failure.md),
[`value-inward-exception-at-the-edge`](value-inward-exception-at-the-edge.md).
