# A fixture should behave like a server

A fixture that answers instantly, always succeeds and carries no metadata is a
fixture every screen is quietly built against — and the differences all surface
on the day the real endpoint lands, which is the worst day to find them.

## Origin

Being told the in-memory adapter did not feel like an API, going to look, and
finding four separate ways it was lying. Each was one line to fix and each had
already shaped a screen.

## What was wrong, and what each one had already cost

    a constant 40ms delay      every loading state looked identical, and none
                               of them looked real. A form whose submit takes
                               half a second had never shown its own pending
                               state to anybody
    no per-attempt id          the failure model distinguishes an INTERACTION
                               id from a per-attempt one; the fixture minted
                               neither, so the distinction was invisible until
                               production
    tokens that never expired  the single most common live behaviour there is —
                               everything works, then every read is a 401 at
                               once — and the guard's whole redirect path was
                               unwalked
    a sleep that ignored abort   a cancellation resolved correctly and LATE:
                               the full latency elapsed first, which is exactly
                               what cancelling was meant to avoid

## The rules that fall out

**A range, not a constant**, and let a route declare its own cost. A credential
check hashes a password; a keyed read does not. A screen laid out against one
uniform delay has never seen the shape it will really have.

**Mint whatever the real one mints.** Per-attempt ids especially: if the model
draws a distinction the fixture cannot express, the distinction is untested.

**Reproduce refusals, not only the happy path.** Count the routes that succeed
against the routes that refuse. If the second number is zero, every screen is
built against a contract nobody serves.

**Expire things.** Sessions, tokens, cursors, anything with a lifetime.

**Honour cancellation in the wait itself**, not after it.

## The one rule that is not about fidelity

**A caller's explicit setting must beat the route's characteristic cost.** A
test asking for zero latency has to get zero. Reversing that precedence turns
the knob into a suggestion and a suite into a wait — measured, at thirteen tests
and eight seconds, which is how realistic fixtures quietly become fixtures
people stop running.

## Gotchas

**Seed lazily.** A top-level call is a side effect, and a module with one cannot
be tree-shaken — see the note on that; it is how fixture data reaches a browser.

**Process-lifetime state is a real limit, and it should be written down.** A map
in a module survives requests and not a restart, which is enough for *sign up,
then sign in* and not enough to design a data model against.

## Used in

`flover-next` and its two sibling templates — the in-memory transport adapter
and the fixture routes for its two domains.

## Related

[`inject-emptiness-not-only-failure`](inject-emptiness-not-only-failure.md),
[`a-top-level-side-effect-cannot-be-tree-shaken`](a-top-level-side-effect-cannot-be-tree-shaken.md).
