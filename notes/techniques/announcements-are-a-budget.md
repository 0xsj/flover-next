# Announcements are a budget

An interface that announces more is not more accessible — noise gets tuned out,
and the announcements that mattered go with it.

## Origin

Building an alert and a loading placeholder in the same sitting, and noticing
that the two obvious implementations overspend in two different directions. Both
look like diligence in review.

## Three ways to overspend, and all of them read as care

**A live role on content that was already there.** A live region announces its
contents when they CHANGE. A message rendered with the page therefore announces
nothing at load — the role is spent and has bought nothing — and then announces
every later re-render as though it were news.

    absent      a styled region, read in document order like any prose
    polite      announced when the reader finishes its current sentence
    assertive   interrupts

Absent is the right default, and it is the one nobody reaches for, because
"should this be announced?" sounds like a question with an obvious answer.

**Interrupting for something that is not urgent.** `assertive` cuts a reader off
mid-sentence. A page that does that for *saved successfully* has taught its user
to resent it, and the next interruption — the one that mattered — arrives at
somebody who has learned to ignore them. The rule of thumb: **if a sighted user
would not be shown a modal, it is not assertive.**

**Announcing one fact N times.** Ten loading placeholders that each say
"loading" is one fact, ten times. A reader hearing it ten times is worse off
than one hearing nothing, because the ten crowd out everything around them.

## The shape of the fix is the same each time

Carry the meaning ONCE, at the level the fact is actually about, and make the
repeated visual thing silent.

    the placeholders   hidden from assistive technology — they carry nothing
    the region         marked busy — one announcement, and the true one

This is the same arrangement a decorative icon uses: the visual repeat is
hidden, and the meaning sits once where a reader will encounter it. When N
things on screen express one state, N is a rendering detail and one is the fact.

## Where a name goes is the same decision

An icon is the smallest version of it, and there are three placements. Only one
is ever right for a given icon, and the wrong ones both spend the budget.

    the icon repeats what is already        hide it. No component, no name.
      written beside it
    the icon sits inside something that     name the CONTROL. Naming the icon
      can carry a name                        as well announces it twice.
    the icon IS the meaning and nothing     name the icon.
      around it can be named

The middle row is where the mistake lives, and it is made by reaching for the
helper component built for the third row. It reads as extra diligence, it is
visible in the source, and it makes the page worse — the same shape as a live
region added because announcing more sounded safer.

## Gotchas

**"More announcements" is not a safe default.** It is the shape of the mistake,
and it is hard to argue against in review because the alternative looks like
doing less.

**A live region that is empty on mount is different from one added later.** The
former is announced when it fills; the latter may not be announced at all,
because the reader never observed it appear. If a message must be heard, render
its container early and fill it.

**Nothing here is testable by looking.** A visual review cannot see an
announcement budget at all, which is why the choice belongs in a prop with a
documented default rather than in whatever the component happened to do.

## Used in

`flover-next` and its two sibling templates — the alert's `live` prop and the
loading placeholders in the feedback group.

## Related

[`a-skeleton-is-a-shape-not-a-spinner`](a-skeleton-is-a-shape-not-a-spinner.md),
[`hand-the-caller-the-wiring`](hand-the-caller-the-wiring.md).
