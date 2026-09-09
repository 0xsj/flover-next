# Choose the cascade tier by failure mode

Where a style belongs in the cascade is decided by what happens when something
beats it, not by which tier is tidiest — and for a handful of rules the right
answer is the one a layer model exists to discourage.

## Origin

A design system with a strict tier model, whose rule was that an inline style is
acceptable for spacing a caller sets on itself and unacceptable for anything a
component owns. Then the one component whose whole job is to not be overridable
turned out to need exactly that.

## What

Sort a rule by asking what a caller winning against it costs.

```
  a caller wins and gets what they wanted    the tier model is right; use a layer
  a caller wins and gets a bug they will     use a layer, and let the escape
    see immediately                            hatch exist
  a caller wins and gets a bug NOBODY         put it out of reach
    sees until it reaches a real user
```

The third row is small — a handful of rules in a whole system — and it is the
one the tier model handles worst, because a layer's entire promise is that a
caller can win.

Visually-hidden text is the canonical member. Its failure mode is stray text on
the screen for every user at once, and it can be caused from a distance: a
composition-layer rule reaching a descendant, a className passed in, a reset that
lands later. Set as a frozen style object, none of that can touch it.

## Why "inline styles are a smell" is not the whole rule

The objection to inline styles is real and is about *authorship*: they cannot be
themed, cannot be overridden, cannot carry a media query, and put appearance in
the component tree where a stylesheet should be.

Every one of those is a cost, and for this one class of rule three of them are
the point. Unoverridable is the requirement. No media query is fine for a rule
with no responsive form. Themeable is meaningless for something with no
appearance.

So the guidance is not "inline styles are bad"; it is that inline styles buy
*immunity from the cascade* and you should only pay for it where immunity is
what you want.

## State the cost where the component is, not in the style guide

The cost of immunity is that CSS can no longer undo it, and that closes a door
somebody will walk into. Hidden text that must become visible on focus — a skip
link — is not expressible this way, because a stylesheet cannot un-set an inline
style.

That is a fine answer as long as it is written on the component as a stated
limit, so the next person builds the second thing instead of quietly widening
the first one until it does both badly.

## Gotchas

**The list is short and stays short.** If a third and fourth rule want immunity,
the tier model is being worked around rather than excepted.

**Immunity is not specificity.** Raising specificity to win an argument is the
opposite move: it invites a higher-specificity reply, and the escalation is the
thing layers were adopted to end.

**A frozen style object beats a merged one.** If a caller's `style` is spread
after yours, the immunity is a convention again — worth knowing which order a
library uses before relying on it.

## Used in

`flover-next` and its two sibling templates — the hiding utility, which is the
one component in the system that sets its own appearance inline.

## Related

[`shorthand-without-a-cascade-layer`](shorthand-without-a-cascade-layer.md) —
the same trade seen from the caller's side,
[`cascade-layers-as-a-tier-model`](../patterns/cascade-layers-as-a-tier-model.md).
