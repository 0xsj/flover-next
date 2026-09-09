# A fieldset refuses to shrink

`<fieldset>` carries a user-agent `min-inline-size: min-content` that no other
element has, so one inside a flex or grid container will not shrink below its
widest child and pushes the whole layout open.

## Origin

**Measured.** A grouped set of form controls placed in a grid column, which then
refused to narrow — the column tracked the longest option's label rather than
its share of the available space. Nothing in the component's own styles
explained it, and the same markup with a `<div>` behaved.

## What

The rendering section of the HTML standard gives `fieldset` a `min-inline-size:
min-content` in the UA stylesheet. It is the only common element that ships one,
which is why the behaviour reads as a bug in your layout rather than a default.

The fix is one declaration on the element:

    min-inline-size: 0

## Why it is worth writing down rather than looking up

It is documented, and it is rediscovered constantly, because the symptom points
somewhere else entirely. A grid column that will not shrink sends people to the
grid — to `minmax`, to `1fr`, to `overflow`, to the parent's width — and none of
those are wrong-looking places to check. The element itself is the last suspect,
since no other element behaves this way.

It also survives every refactor of the layout around it, so it comes back.

## Gotchas

**`min-width: 0` is the same fix under the older name**, and both are needed only
on the fieldset — not on its children and not on the container.

**A legend has its own layout rules too.** It participates in the fieldset's box
rather than the normal flow, which is why padding on it behaves unlike padding
anywhere else. Do not reach for a replacement element to avoid this: the legend
is the only element announced before every control in the group, and losing it
costs the group its name.

## Used in

`flover-next` and its two sibling templates — the grouped-controls primitive.

## Primary source

The HTML Standard's rendering section, `fieldset` and `legend`. Re-check on a
major browser release; this is UA-stylesheet behaviour rather than something an
author's stylesheet can be blamed for.
