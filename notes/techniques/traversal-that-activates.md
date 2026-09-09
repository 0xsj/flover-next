# Traversal that activates

Arrow-key traversal that activates as it moves is the right default and the
wrong one the moment activation costs something — four tabs walked past becomes
four panels loaded.

## Origin

Wiring a tab strip and reading its `activationMode`. The default activates on
arrow, which is the platform contract and what a keyboard user expects: you
arrow to a tab and you are looking at it.

Then noticing what that means for a tab whose panel fetches.

## What

Two modes, and the choice is about the cost of the destination rather than about
taste:

    automatic   arrow moves focus AND activates. One keystroke, one result.
                Correct when a panel is already rendered or cheap to render.
    manual      arrow moves focus; Enter or Space commits. Correct when
                activation costs a request, a chart, a large render.

Automatic is right often enough to be the default and should stay the default.
The point is that it is a **decision per strip**, not a global setting, and the
expensive case is the one nobody notices.

## Why nobody notices

A mouse user cannot produce the failure. They click the tab they want and load
one panel; travelling *past* tabs is a keyboard-only motion. So the cost appears
in exactly the review nobody runs, and it appears as load rather than as an
error — four requests where one was intended, attributed to a chatty client
rather than to a keystroke.

It also scales the wrong way: the more tabs a strip has, the more expensive the
traversal, and a strip only grows.

## Gotchas

**The same question exists outside tabs.** Any roving-focus list where landing on
an item does something — a preview pane, a filter that refetches, a master-detail
list — has the identical choice, usually with no prop to set and a handler that
fires on focus.

**Manual activation needs a visible focus state distinct from the selected
state.** Otherwise a user arrowing through cannot tell where they are versus what
is showing, and the mode is worse than the one it replaced.

**Do not solve it by debouncing.** A delay makes the expensive traversal cheaper
and the interaction less predictable, and it still fires for anyone who pauses.
The mode is the answer; the timer is a way of half-having it.

## Used in

`flover-next` and its two sibling templates — the tab primitive's activation
mode, with both modes demonstrated side by side.

## Related

[`lookalike-controls-are-different-promises`](lookalike-controls-are-different-promises.md)
— a role is a keyboard contract, and this is a decision inside one.
