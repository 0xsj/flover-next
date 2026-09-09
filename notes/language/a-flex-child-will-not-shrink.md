# A flex child will not shrink

A flex item's `min-width` computes to `auto`, not `0`, so an item refuses to
narrow below its own content and overflows the row it is in.

## Origin

**Measured.** A two-column flex row where the growing column contained a long
unbroken string. The column pushed past the container, the row scrolled, and
nothing in either element's styles said why — `flex: 1` was present, `overflow`
was not set anywhere, and the parent had a width.

## What

Inside a flex container, `min-width` and `min-inline-size` compute to `auto`
rather than `0`. `auto` means *the content's minimum*, which for text is the
longest unbreakable word and for a nested flex row is the sum of its children.

An item given `flex: 1` therefore grows but does not shrink past that floor.

    min-inline-size: 0

on the item is the fix, and it belongs on the item that grows, not on the
container.

## Why the symptom points elsewhere

Everything about the failure suggests the container. A row that overflows its
parent sends people to the parent's width, to `overflow`, to `box-sizing`, to
the grid or flex definition — all reasonable, all wrong. The item's own
`min-width` is not in the stylesheet at all, because nobody wrote it: it is a
computed default that exists only inside a flex context.

It also only appears with certain content. Short labels never hit the floor, so
the layout is correct for months and breaks the first time somebody has a long
hostname, a URL, or a name without spaces.

## Gotchas

**A component that offers a `grow` prop should set it.** The caller asked to
grow; handing them the overflow as well is handing back a platform quirk they
did not choose. Set `min-inline-size: 0` alongside the grow.

**Grid has the same rule with a different spelling.** A grid track's `minmax`
floor is `auto` too, which is why `minmax(0, 1fr)` is the common incantation.
Same defect, same cause, different syntax.

**`overflow: hidden` on the item also works and is not the same fix.** It
changes the item's formatting context and clips content instead of letting it
wrap. Reach for the minimum first.

## Used in

`flover-next` and its two sibling templates — the flex primitive's `grow`.

## Primary source

CSS Flexible Box Layout, the *Automatic Minimum Size of Flex Items* section.
Stable behaviour, not a browser bug; re-check nothing.

## Related

[`fieldset-does-not-shrink`](fieldset-does-not-shrink.md) — a different element
with the same shape of defect, and the same misleading symptom.
