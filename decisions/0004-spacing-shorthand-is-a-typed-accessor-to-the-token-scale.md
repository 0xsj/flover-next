# 0004 — spacing shorthand is a typed accessor to the token scale, not a utility layer

**Status:** Accepted   ·   **Date:** 2026-09-09

## Context

`CLAUDE.md` states, as a stack rule: **"No Tailwind. The token layer and the
cascade tiers do this job, and a utility layer competes with them for the same
decisions."**

A shorthand style-prop system — `p={3}`, `py={2}`, `gap={4}` — is that same
model expressed as props rather than classes. Adding one is therefore reversing
an argument this project already made against itself, which is on the bar for a
decision record whatever else is true.

What is also true is that the rule names a mechanism, not an outcome. The
objection is **competition for the same decisions**: a second scale to keep in
step, and a second place in the cascade where a colour or a border can be set.
Both are properties of how a shorthand is built, not of shorthand existing.

## Decision

**A spacing shorthand is adopted, built so that it competes with nothing.**

**It resolves to the existing tokens.** `p={3}` is `var(--space-3)`. There is no
second scale — the twelve steps are the ones already in `styles/tokens`, and a
change there moves the props with it.

**It emits an inline style, not a class.** Nothing is generated, nothing is added
to `@layer`, and a caller adjusting a gap cannot affect a primitive's own
stylesheet. There is no specificity contest because there is no second rule.

**Its scope is spacing and flow only** — padding, margin, gap, and the flex
arrangement props. No colour, no typography, no borders, no radii. That is the
line between a typed accessor to the token layer and a utility framework: a prop
for a colour would let a screen restyle a primitive from the outside, which is
exactly what the cascade tiers exist to prevent.

**The edge shorthands are logical.** `pl` is inline-start, not left. The familiar
letters are kept because in a left-to-right document they are the same thing.

Four primitives use it: `Box`, `Flex`, `Container`, `Separator`.

## Alternatives

**No shorthand — a CSS module per arrangement, as before.** What the project
shipped with, and it is not wrong. Rejected because the modules were accumulating
one-rule classes whose entire content was a padding from the token scale, which
is a stylesheet re-implementing a scale that already exists, once per component.

**Generated utility classes, Tailwind or otherwise.** The thing the rule
forbids, and rightly: it is a real cascade layer, it competes with
`@layer primitive` for specificity, and it ships a second scale that must be
kept in step with the tokens. Rejected on the original argument, unchanged.

**CSS custom properties on the element, consumed by a class.**
`style={{ "--p": … }}` with `.box { padding: var(--p, 0) }`. Marginally more
capable — a media query could read the same variable — and rejected for now
because it needs a class per property, which is the utility layer arriving by a
quieter route. Revisit if responsive shorthand is wanted.

**Shorthand for colour and type as well.** Rejected outright. It is the whole
difference between this and a utility framework, and the point at which a screen
gains the ability to restyle a primitive.

## Consequences

**Inline styles beat every layer, including `override`.** A caller cannot undo a
Box's padding from a stylesheet — they must change the prop. That is acceptable
for spacing a caller set on itself, and it would not be for anything a component
owns, which is a second reason the scope stops where it does.

**No responsive variants.** `p={[2,3,4]}` is not expressible, because an inline
style has no media query. A screen needing one writes a CSS module, as before.
This is a real capability the rejected alternative would have had.

**Two ways to express spacing now exist.** A module rule and a prop. The
guidance is that a component's own spacing lives in its module and a caller's
arrangement of components lives in props — but nothing enforces it, and this is
the cost most likely to be felt.

**`CLAUDE.md`'s "no utility layer" line now needs reading with this record**, or
it will be cited against the thing it was amended to permit.

## Verification

- The props resolve to token references and never to literal values, and `0` is
  the only literal. Asserted in the layout group's tests.
- Space props are stripped before the remaining props reach a DOM element, so no
  unknown attribute is emitted. Asserted.
- Edges map to logical properties, so a right-to-left document follows the text.
  Asserted.
- **Not verified:** that no future prop adds colour or typography. That is a
  review property, and `protocols/spec-tests.md` is explicit that a discipline
  cannot be tested — a check could plausibly assert the exported prop list
  against an allowlist, and none exists.
- **Not verified:** the guidance about which spacing lives where. Nothing
  distinguishes a component's own padding from a caller's arrangement.
