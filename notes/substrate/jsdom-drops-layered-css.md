# jsdom drops layered CSS

A test environment that applies a plain CSS rule and silently ignores the
identical rule inside `@layer` will pass every style assertion you write against
a design system where all the CSS is layered — because the class it is checking
does nothing there either.

**True of `jsdom` 30 under `vitest` 5 · measured 2026-09-09**

## Origin

**Measured.** About to assert that a hiding utility actually hides, in a project
whose every stylesheet opens with `@layer`. The suite runs with CSS processing
off by default, so the first question was whether turning it on would make the
assertion real.

It does not, and the way it fails is the problem: turning it on makes the
assertion *look* real.

## What was measured

With `css: true`, one CSS Modules file, two rules:

```css
.plain   { position: absolute; clip-path: inset(50%); }
@layer primitive { .layered { position: fixed; } }
```

```
  .plain     getComputedStyle → position: absolute · clip-path: inset(50%)
  .layered   getComputedStyle → position: static
```

One stylesheet attached, no error, no warning, no diagnostic anywhere. The
layered rule is parsed and discarded.

With `css: false` — the default — class NAMES are still generated and applied
(`_layered_ed63a6` lands on the element), so a test that asserts a className
passes in both configurations and means nothing in either.

## Why this is the dangerous shape

Both failure directions flatter you.

**With CSS off**, asserting the class name reads as a style test and is a string
comparison against a hash.

**With CSS on**, `getComputedStyle` is the real API, the value comes back, and
the value is the *initial* value — indistinguishable from a rule that exists and
computes to the default. So the assertion that a hidden element is `position:
absolute` fails, you conclude the component is broken, you "fix" it, and the
version you ship is the one that satisfied the environment rather than the
browser. Or you assert the initial value and pin nothing at all.

A whole design system on cascade layers is therefore a design system whose
styling is **not observable in this environment**, and the environment will not
say so.

## What to do instead

**Assert the accessibility tree, and appearance only where it is inline.** An
inline style is in the DOM and needs no CSS engine, so a component that sets its
appearance in a style object is fully testable here while an identical one using
a layered class is not.

**Say which half is unasserted, in the test file.** A suite that covers the
semantics of a component and none of its rendering should state that, or the
count implies otherwise.

**Real styling belongs in a real browser.** Cascade layers, container queries and
`@supports` are all in this category; a headless DOM is the wrong instrument and
the answer is a browser runner, not a cleverer assertion.

## How to re-check when this ages

Re-run the two-rule probe above. It takes two minutes and is the only thing that
settles it — the cause was not verified here (jsdom's own CSSOM, not read), so
this note is a measurement and not an explanation.

## Used in

`flover-next` and its two sibling templates — the component suites, which assert
roles, names and inline styles and no layered CSS at all.

## Related

[`cascade-layers-as-a-tier-model`](../patterns/cascade-layers-as-a-tier-model.md),
[`probe-before-writing-a-weaker-assertion`](../techniques/probe-before-writing-a-weaker-assertion.md).
