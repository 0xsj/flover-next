# The shell owns the interaction

A shell tier's most valuable member is the one nobody thinks to put there — the
identity of the current user action, without which a correlation id is just a
second request id.

## Origin

**Measured, by absence.** Three separate tiers referenced this tier before it
existed: a token file said density was set by it, a composition root's doc said
an interaction should scope a root, and a reference screen had to admit in its
own copy that it was scoping an interaction to a component lifetime because
nothing held the real one.

The correlation id had been threaded through the transport, attached to failures,
preserved across two folds and carried into fault injection — and on the client
it still meant nothing, because no layer could say when one user action began.

## What belongs here

State the shell owns and no server has an opinion about. Three kinds, and the
third is the one that gets forgotten:

    theme        a preference, per browser
    density      a preference that is also a token override
    interaction  the identity of what the user is currently doing

What unites them is not that they are UI — it is that a server cannot answer any
of them, and no component owns them either, because more than one component must
agree.

## Why an interaction is neither a request nor a component lifetime

**A request** is too narrow: a click that fans out into four requests is one
action, and scoping the id per request produces four unrelated failures. That is
the exact question the id exists to answer, unanswered.

**A component lifetime** is too broad and also wrong-shaped: a mount tells you
which screen was open, not what the user did. Two clicks on one screen are two
interactions; a screen that re-renders is still one.

So it is minted in an **event handler** — the only place that knows a user did
something — and handed to whatever composes the calls that follow.

## Preferences have three states and the third is expressed by ABSENCE

*Follow the system* is a choice, not the lack of one. A user who picked it wants
the page to change when their OS does; a user who picked light wants it not to.
Collapsing them to a boolean loses a distinction that cannot be recovered.

It is represented by **removing** the attribute rather than writing a value, so
the environment's own query takes over. That is why a themed token layer states
its palette twice — once under the environment query, once under an explicit
attribute — and it is a shape worth recognising: a tri-state where one member is
the absence of a mark.

## Gotchas

**Never mint an interaction at module load.** On a server that is one id shared
by every request — one user's action attributed to the next. Start empty, so a
caller can see that nothing has begun.

**Read stored preferences after mount, never during render.** The server has no
storage, so a value read there is a hydration mismatch. It presents as a flash
of the wrong theme that corrects itself, which people fix by disabling
server rendering for a whole subtree.

**Keep the stores free of a framework and let one file bind.** The state machines
and the persistence are the transferable part; the subscription hook is three
lines each sibling writes. But do NOT then claim the directory is portable — one
binding file in it is enough to make that false, and a portability check that
lies is worse than none.

**A no-op write must notify nobody.** A store that fires on an equal assignment
is a render loop waiting for a component that writes during render.

## Used in

`flover-next` and its two sibling templates — theme, density and the interaction
id, with one binding file per framework.

## Related

[`a-root-is-handed-its-context`](a-root-is-handed-its-context.md),
[`absence-is-a-value-not-a-failure`](absence-is-a-value-not-a-failure.md).
