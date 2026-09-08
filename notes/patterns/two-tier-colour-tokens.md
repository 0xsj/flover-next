# Two-tier colour tokens

A theme should swap which rung of a fixed ramp a role points at, never the ramp
itself.

## Origin

Adopted from a working design system. Verified here by rendering both tiers side
by side with their resolved values and switching themes: the semantic values move,
the ramp does not.

## What

Two files, and the split is the whole idea.

- **Primitives.** Raw values — a neutral ramp, a hue family per status, a set of
  translucent overlays. Fixed. Identical in every theme.
- **Semantic.** Roles — surfaces, lines, ink levels, accent, status. Every one is
  a reference to a primitive, and a theme redefines *only* this tier.

A component may read the semantic tier and never the primitive one.

## Why

A theme that redefines raw values has no way to express "this role is quieter in
light mode" except by editing the colour, and the two themes then diverge into
independent palettes that drift.

Pointing roles at rungs makes the ramp a shared, auditable object. A light theme
picking a darker rung for the same role is a legible, reviewable change; the
ratios stay computable because both themes draw from one set of literals.

It is also what makes the contrast audit possible at all — a role resolves to a
literal by walking one indirection, so it can be checked without a browser.

## Example

A display of the tiers should show **the resolved value next to each swatch**,
not just the swatch. A chip alone cannot distinguish "this role is correct" from
"this name does not exist" — an undefined custom property paints nothing, which
looks deliberate. Reading the computed value back is what turns a swatch grid into
a measurement, and an empty value is the failure worth seeing.

## Gotchas

**Three theme states, not two.** An explicit choice and "follow the system" are
different states, and the palette usually has to be stated twice — once under the
system media query, once under the explicit attribute. Those two blocks can drift
and nothing will tell you.

**Translucent tokens do not resolve to a literal.** Anything that audits the ramp
will score them zero. That is correct behaviour and it means the audit's coverage
is smaller than the token list.

**A primitive appearing in a component's stylesheet is the defect the split
exists to make visible.** It is worth a check, because it is invisible in review —
the colour is right, and the theme is what breaks later.

## Used in

`flover-next` and `overwatch-ui` — the same two-file split, audited from source in
both.

## Related

[`cascade-layers-as-a-tier-model`](cascade-layers-as-a-tier-model.md),
[`audit-the-source-not-the-render`](../techniques/audit-the-source-not-the-render.md).
