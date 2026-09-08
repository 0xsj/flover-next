# The layer order statement must arrive first

A `@layer` order statement can only order layers it has not already seen, so the
file carrying it must be the first stylesheet in the document.

**True of Next 16.3.4 with Turbopack · verified 2026-09-08**

## Origin

The failure was **measured in the project this token layer was extracted from**,
where importing the globals file after the components inverted the tier model and
a naive reset rule began beating every button in the system.

Here it was **verified by reading the emitted output** rather than by reproducing
the failure: the prerendered HTML's stylesheet links, in order, with the sheet
carrying the order statement first and every `@layer screen` chunk after it.

## What

Turbopack emits CSS chunks in **import-graph order**. Whatever the root layout
imports first becomes the first stylesheet in the document.

The cascade-layers rule is that layer order is fixed by first appearance. An
explicit order statement therefore only takes effect for layers not yet
encountered; any layer already established keeps the position it got.

Put together: if a component stylesheet loads before the file carrying the order
statement, that component's layer is registered first, and the statement then
appends the earlier tiers — reset, token, base — *behind* it. The precedence model
inverts. Nothing errors.

## Why the failure is hard to attribute

The symptom is that a blunt rule in the earliest tier starts winning against
component styles. It looks like a specificity problem in the component, because
that is where the wrong appearance is. The actual cause is an import statement in
a different file, and moving that one import fixes every symptom at once — which
is not a connection anyone makes from the symptom.

It also only appears once there are enough component stylesheets for the ordering
to matter, so it arrives well after the pattern was introduced.

## Example

Import the file carrying the order statement above every other import in the root
layout, and leave a comment saying why — because it looks like an unsorted import
and any formatter or tidy-up pass will happily move it.

Verify by reading the built output rather than the source: extract the
stylesheet links from a prerendered page and confirm the sheet containing the
order statement is first.

## Gotchas

**Import order in the layout is load-bearing and looks like style.** This is the
whole hazard. A lint rule that sorts imports alphabetically will break it
silently.

**It is the first *stylesheet*, not the first import overall.** Non-CSS imports
above it are harmless.

**Development and production can differ in chunking.** Check the production
build, which is what ships.

## Used in

`flover-next` — the root layout, with the reason recorded inline at the import.

## Primary source

CSS Cascade and Inheritance Level 5 — *Layer Ordering*, for the first-appearance
rule. The chunk-emission order is observed behaviour of this Turbopack version and
is not, as far as I can find, documented; treat it as measured rather than
specified, and re-check on a major upgrade.
