# Cascade layers as a tier model

Declaring layer order once makes "a caller may override a primitive" a property of
the cascade rather than a convention about specificity.

## Origin

Adopted from a working design system rather than derived here. Verified in this
repository by reading the emitted stylesheets: the order statement is the first
rule of the first sheet, and every component stylesheet lands in a later layer.

## What

One line declares the whole precedence model:

```
  @layer reset, token, base, primitive, composition, screen, override;
```

Every stylesheet then names the tier it belongs to, and nothing else about
precedence is ever decided. A reset lives in the first layer, design tokens in
the second, component styles in `primitive`, an arrangement of components in
`composition`, a page in `screen`.

## Why

Without layers, a design system's precedence is an emergent property of selector
specificity, and the usual outcome is an escalation: a screen needs to override a
component, so it adds a parent selector; the component then needs to beat the
screen, so it doubles a class. Neither change is wrong locally and the system
loses the ability to say who wins.

With layers, a later layer beats an earlier one **regardless of specificity**. A
screen overriding a primitive is a single class in a later layer, which is what
the rule promised all along.

The consequence people underrate: the reset can be written naively. A blunt
`button { border: none }` in the first layer is safe, because every component
style is in a later one. Without layers that rule fights every button in the
system and loses in a way that depends on load order.

## Example

The order is the architecture, read left to right:

```
  reset        the platform, flattened
  token        values, and nothing that paints
  base         document defaults that use tokens
  primitive    one component, alone
  composition  components arranged together
  screen       one page's own needs
  override     the escape hatch, deliberately last and deliberately named
```

`override` exists so that the escape hatch is visible in a grep rather than
disguised as a very specific selector.

## Gotchas

**The order statement only orders layers it has not already seen.** If a
component stylesheet reaches the browser first, its layer is established first and
the statement then appends the earlier tiers *behind* it — inverting the model
silently. Nothing errors; the page just renders wrong. See
[`turbopack-css-chunk-order`](../substrate/turbopack-css-chunk-order.md).

**A CSS Module refuses a selector with no local class in it.** Scoping something
like `scroll-margin` to an attribute alone fails the build rather than leaking, so
such rules must name a local class.

**Layers do not beat inline styles or `!important`.** The model covers
stylesheets; it does not make those disappear.

## Used in

`flover-next` and `overwatch-ui` — the same seven-layer order in both.

## Related

[`two-tier-colour-tokens`](two-tier-colour-tokens.md) — what lives in the `token`
layer.
