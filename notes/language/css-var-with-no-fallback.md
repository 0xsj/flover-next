# `var()` with no fallback does not degrade

An undefined `var()` with no fallback does not fall through to the rest of the
declaration — it invalidates the whole custom property.

## Origin

Caught by reading, not by a failure. Extracting a token layer between projects,
a family token read `var(--font-inter), ui-sans-serif, system-ui, sans-serif`,
where `--font-inter` was defined by the *other* project's root layout and by
nothing in the new one.

**Read, not measured here.** The behaviour is specified; no test in this
repository demonstrates it, because the environment used for component tests does
not resolve custom properties faithfully enough to prove it.

## What

A `var()` referencing an undefined custom property, with no fallback argument,
produces the *guaranteed-invalid value*. That value poisons the entire declaration
it appears in — it does not simply drop the one term.

So this:

```
  --font-sans: var(--undefined-name), system-ui, sans-serif;
```

does not yield `system-ui, sans-serif`. It yields an invalid `--font-sans`, and
anything reading `var(--font-sans)` then falls back to the inherited or initial
value for that property.

## Why it matters more than it looks

A comma-separated font stack *reads* like a fallback chain, so the natural
assumption is that a missing first entry is skipped. It is not, and the failure
is quiet: the page still renders, in whatever the inherited font happens to be,
which on a fresh document looks like a deliberate choice rather than a broken
token.

It is worst in exactly the situation that produces it — moving a token layer
between projects, where the variable that satisfied it was declared somewhere
that did not come along.

## Example

Give the reference a fallback, and name the hook after its role rather than after
the thing that currently satisfies it:

```
  --font-sans: var(--font-sans-src, ui-sans-serif), system-ui, sans-serif;
```

Two things fixed at once. The declaration survives an unsatisfied hook, and the
token no longer names a specific family — so swapping the family is one line
somewhere else and this file never learns about it.

## Gotchas

**A fallback inside `var()` is not the same as a later term in the list.** The
fallback is the second argument; everything after the closing paren is a separate
term and does not rescue an invalid reference.

**Nothing warns.** No console message, no build error. The property is simply
invalid at computed-value time.

**It is not the same as an unset property with no `var()`.** A declaration that
simply omits a value falls back normally; only the `var()` path poisons.

## Used in

`flover-next` — the typography token file, where both family hooks carry a
fallback for this reason.

## Primary source

CSS Custom Properties for Cascading Variables Module Level 1 — *Invalid
Variables*, and the definition of the guaranteed-invalid value.

## Related

[`two-tier-colour-tokens`](../patterns/two-tier-colour-tokens.md) — the same
indirection, where an unresolved name shows up as a swatch that paints nothing.
