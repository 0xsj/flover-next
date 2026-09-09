# Three states die at the render

Every tier can keep a distinction intact and one ternary at the last call site
destroys it — so the collapse has to be made unwriteable by a component rather
than forbidden by a rule.

## Origin

A data model that carefully separates *found*, *looked and found nothing* and
*nobody looked* — a type that removes the not-found case from a read whose
absence is legitimate, a transport that refuses to invent a 404, a fixture that
answers "never asked" rather than "does not exist".

All of it survives to the component boundary and is then thrown away by:

    value ? render(value) : "–"

## What

Three renderers, each closing one route to the collapse:

    a PRESENCE renderer   takes the three-state value and renders all three.
                          There is no branch for a caller to forget.
    a STAT                treats an absent number as unmeasured and prints a
                          dash. Never a zero.
    an EMPTY state        is a component of its own, so "we got an answer and it
                          was nothing" cannot be styled as a failure by default.

And the two absent states must not LOOK alike, or the component has thrown away
the distinction it exists to keep.

## Why a rule is not enough here

The rule — *keep them apart* — is understood by everybody and obeyed everywhere
except the last three characters of an expression, because at that point the
distinction has stopped feeling like a distinction. There is a value or there is
not. The ternary is the shortest correct-looking thing to type.

A component removes the shortest path. Handing the whole value to something that
renders all three means there is no branch to omit, and the mistake changes from
*forgetting a case* to *reaching past a component that exists* — which is
visible in review in a way a ternary is not.

## An unmeasured number is not zero, and this one is worth stating alone

A zero is a measurement. An absent number is the absence of one. A screen that
prints `0` for something nobody counted is not being tidy, it is **asserting a
fact nobody established** — and the reader has no way to tell the two apart,
because zero is a completely plausible answer.

## Gotchas

**Define the meaning of each state ONCE.** A table cell, a legend and a screen
reader describing "never checked" in three slightly different ways is the
distinction being lost in the copy rather than in the data — which is harder to
notice and just as final.

**Say what is absent, not that data is.** "No targets yet" is an answer; "No
data" is a shrug, and it is the same shrug for an empty result, a failed request
and a filter that matched nothing.

**An empty state is a SUCCESS.** Styling it like an error teaches people to read
a working system as broken, and then to ignore the real errors that look the
same.

**Hover-only disclosure does not count.** If the only way to learn which absent
state a dash means is a tooltip, the distinction is preserved for pointer users
and lost for everyone else.

## Used in

`flover-next` and its two sibling templates — the presence, stat and empty
renderers in the display group.

## Related

[`absence-is-a-value-not-a-failure`](../patterns/absence-is-a-value-not-a-failure.md)
— the same distinction, defended one tier lower in the type.
