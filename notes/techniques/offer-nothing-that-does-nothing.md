# Offer nothing that does nothing

A control that cannot change anything should not be a control — offering it costs
a reader a stop, a decision, and some of the trust that the next one will do
something.

## Origin

Building a breadcrumb and asking whether the last crumb should be a link. The
obvious answer is yes, because every other crumb is one and the row looks
inconsistent otherwise. The obvious answer is wrong: a link to the page you are
already on is offered, focused, activated — and nothing happens.

## What

The last crumb is a span carrying `aria-current="page"`. The meaning is not lost
because it was never in the anchor: the anchor was carrying *navigability*, and
there is nowhere to navigate.

The same shape appears wherever an affordance outlives its purpose:

    the current page in a breadcrumb   nothing to navigate to
    a sort control on a one-row table  nothing to reorder
    "next" on the last page            nothing to advance to
    a filter with one possible value   nothing to filter

Each one looks like completeness and reads, to somebody moving by keyboard, as a
promise that is not kept.

## Why "it looks inconsistent" is the weaker argument

Visual consistency is real and it is not the same as structural consistency.
Making the last crumb a link buys a row of identical-looking items and sells a
reader a control that does nothing — and the reader who pays for that is the one
navigating by keyboard, who cannot see the row at all and only encounters the
sequence of stops.

The consistency worth having is that **everything focusable does something**. A
list where two items are links and one is text is honest about which is which.

## Gotchas

**Disabling is not the same as omitting, and is sometimes correct.** A disabled
control says *this exists and is unavailable now*, which is information. A
control that could never do anything in this state is different: it should not be
there. The test is whether the reader could ever make it work.

**Do not replace a useless control with a useless focusable.** A span with
`tabindex="0"` is the same defect with extra steps.

**The marking still has to happen.** Removing the anchor removes the wrong thing
if `aria-current` does not take its place — then the position is lost as well as
the pointless control.

## Used in

`flover-next` and its two sibling templates — the current crumb in the
breadcrumb primitive.

## Related

[`lookalike-controls-are-different-promises`](lookalike-controls-are-different-promises.md).
