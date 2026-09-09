# Shorthand without a cascade layer

The objection to a utility layer is that it ships a second scale and competes in
the cascade — remove both and the same shorthand is a typed accessor to the
tokens rather than a rival to them.

## Origin

A project whose stack rules said, in as many words, that a utility layer competes
with the token layer and the cascade tiers for the same decisions — and then
wanted `p={3}` and `gap={4}`, which is that model with props instead of classes.

Reading the rule again, it names a MECHANISM and objects to a CONSEQUENCE. The
consequences are two, and both are properties of how a shorthand is built rather
than of shorthand existing.

## What

Three constraints, and the design falls out of them:

**Resolve to the existing tokens.** `p={3}` emits `var(--space-3)`. There is no
second scale, so there is nothing to keep in step — a change to the token file
moves every call site with it.

**Emit an inline style, not a class.** Nothing is generated and nothing joins
`@layer`. There is no specificity contest because there is no second rule, and a
caller adjusting a gap cannot reach a component's own stylesheet.

**Spacing and flow only.** Padding, margin, gap, the flex arrangement. No
colour, no typography, no borders, no radii. This is the line: a colour prop
would let a screen restyle a primitive from the outside, which is the thing a
layer model exists to prevent.

## Why the third constraint is the real one

The first two are mechanical and easy to hold. The third is where every system
of this kind erodes, because each addition is individually reasonable — a
`bg`, then a `color`, then a `rounded`, then a `shadow` — and none of them
announces that the primitive has stopped owning its own appearance.

Write the boundary down as a rule about *categories*, not as a list of props.
A list gets appended to; a category has to be argued with.

## Keep the edge shorthands LOGICAL

`pl` is inline-start, not left. Keep the familiar letters — in a left-to-right
document they are the same thing, so nobody has to learn a new alphabet — and map
them to the logical properties, so a right-to-left document puts the padding
where the text is rather than where the screen's west side is.

Physical names would be a lie that surfaces only in a language nobody on the team
reads, which is the worst kind: correct-looking forever, wrong the day it
matters.

## Gotchas

**An inline style beats every layer, including the escape hatch.** A caller
cannot undo it from a stylesheet — they change the prop. Acceptable for spacing a
caller set on itself; unacceptable for anything a component owns, which is the
second reason the scope stops where it does. There is one exception and it is
worth knowing about, because it is the same property wanted deliberately:
[`choose-the-cascade-tier-by-failure-mode`](choose-the-cascade-tier-by-failure-mode.md).

**No responsive variants.** An inline style has no media query, so an array-valued
prop is not expressible. A custom property consumed by a class would allow it and
needs a class per property, which is the utility layer arriving by a quieter
route. Decide that deliberately rather than discovering it.

**Two ways to express spacing now exist.** A module rule and a prop. The
guidance — a component's own spacing in its module, a caller's arrangement in
props — is sound and unenforced, and it is the cost most likely to be felt.

**Strip the shorthand props before spreading.** Otherwise they reach the DOM as
unknown attributes.

## Used in

`flover-next` and its two sibling templates — the layout primitives' spacing
props.

## Related

[`shadowing-a-platform-attribute`](shadowing-a-platform-attribute.md).
