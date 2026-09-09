# A skeleton is a shape, not a spinner

A skeleton earns its complexity by being the shape of what is coming; anything
else is a spinner with more code and a worse reveal.

## Origin

Building a loading placeholder and asking what it is actually for, given that a
spinner is one line and communicates *waiting* perfectly well.

## What

The answer is not "it looks nicer". It is that **the layout does not move when
the content lands**. That is the whole return, and it is only collected if the
placeholder occupies the same space the content will.

Which means the useful defaults are:

    fill the container      the container already knows the width
    take a size             for the cases where it does not
    a text variant          whose LAST line is short, because real paragraphs
                            end mid-line and equal bars read as a table

A generic grey rectangle of arbitrary height collects none of it. The content
arrives, the box was the wrong size, everything below jumps — which is the
defect the skeleton was supposed to prevent, now with an animation attached.

## Why the cheap version is worse than a spinner

A spinner is honest: it says *waiting*, occupies a known small space, and nobody
expects the layout to be stable around it. A mis-sized skeleton makes a promise
about the shape of what is coming and then breaks it, and the break is a jump at
exactly the moment the reader's attention arrives.

If the shape is not known, a spinner is the correct choice. Reaching for a
skeleton because it looks more modern is paying for a guarantee you have not
arranged to keep.

## The meaning must not live in the motion

A shimmer is pleasant and it is not the message. Under a reduced-motion
preference the animation stops — and what has to survive is the *colour*
difference, which is what says "not yet".

A placeholder that is legible only while it moves has put its one piece of
information in the channel some people have switched off. Check it with motion
disabled, not just with a screenshot.

## Gotchas

**Placeholders are hidden from assistive technology**, and the busy state goes
on the region. See
[`announcements-are-a-budget`](announcements-are-a-budget.md).

**A skeleton for a list needs a plausible COUNT**, not one row. Rendering one
placeholder for what becomes eight rows is the same layout jump in a different
disguise.

**Do not animate a skeleton that will be replaced within a frame or two.** A
flash of shimmer is noise; below roughly a couple of hundred milliseconds,
showing nothing is better than showing a placeholder that blinks.

## Used in

`flover-next` and its two sibling templates — the loading placeholders in the
feedback group.

## Related

[`announcements-are-a-budget`](announcements-are-a-budget.md),
[`three-states-die-at-the-render`](three-states-die-at-the-render.md).
