# Portable by having no alias

A tier is copyable between sibling projects exactly when it names no framework
and no path alias — and the alias is the half people forget.

## Origin

Three sibling templates hold the same architecture in three frameworks. The
tiers meant to be shared were framework-free from the start and still would not
have copied cleanly, because four files imported a neighbour through the
project's path alias — and the alias is the one thing that differs per sibling
by construction.

## What

Two rules for any tier intended to travel:

  · no framework import
  · **no path alias** — reach a sibling directory relatively

Then the directory copies verbatim, and a diff between the repositories is a
meaningful check that they have not drifted. With an alias in it, every copy
needs a rewrite and "the same design" quietly stops being "the same bytes".

## Why

Aliases are invisible to the usual portability instinct. A reviewer scanning for
framework imports will pass an alias import without a thought — it looks like an
internal reference, and inside one repository it is. It only bites at the moment
of copying, which is months later and somebody else's afternoon.

The verbatim property is worth more than convenience. Once a tier copies
byte-for-byte, drift between siblings becomes detectable by `diff` rather than by
reading two implementations and hoping.

## Example

Make it a check, not a convention. Two assertions over the portable
directories — no framework import, no alias — plus a third asserting the check
read a non-zero number of files, so it cannot pass by scanning nothing.

Then **prove each one can fail** by introducing the violation and watching it go
red. A green check nobody has ever seen fail is a green check about nothing.

## Gotchas

**Relative imports upward are only safe for a tier that ships with its
neighbour.** Two directories copied as a pair may reach each other; a tier that
travels alone must not.

**The check must exclude its own test files**, which legitimately use the alias
to reach the tier under test.

## Used in

`flover-next` — the kernel and transport tiers, copied into the Solid and Svelte
siblings.

## Related

[`value-inward-exception-at-the-edge`](value-inward-exception-at-the-edge.md) —
another rule that needed a check rather than a sentence.
