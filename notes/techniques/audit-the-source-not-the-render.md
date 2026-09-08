# Audit the source, not the render

Contrast is checkable from the stylesheet at build time, and that is stronger
than checking it in a browser, because a `var()` chain resolves exactly and no
screenshot is involved.

## Origin

Building a token page and wanting the contrast ladder to be a fact rather than an
impression. Measured: 26 foreground/background pairs across two themes, all
resolved from the stylesheet source with no browser involved.

## What

Parse the token stylesheets, walk each `var()` chain to a literal, compute WCAG
relative luminance, and report the ratio per promised pair. It runs wherever the
files are readable — a build step, a test, a server component — and needs no DOM,
no headless browser and no screenshot.

## Why

The eye has no scale for a ratio. It confirms that a label *exists* and moves on,
which is why this class of defect clusters on small text carrying information and
never on body copy — nobody misjudges body copy.

A browser-based check is also available and costs much more: a real render, a
headless driver, and a screenshot pipeline that has to be kept working. The
source parse gets the same answer for flat colours because the computation is
deterministic — it is the same arithmetic the browser would do.

## Example

The shape that matters is the `var()` walk, and the discipline is what it does
when it cannot finish:

- resolve to a literal, or return **null**
- a null scores `0.00` and fails loudly

Never a guess. A pair that scores 0 because a value was a translucent colour is a
visible gap; a pair that scores 4.6 because the resolver substituted something
plausible is a passing row that means nothing.

Track visited names while walking. A token that refers to itself otherwise spins
forever at build time, which is a worse failure than a wrong number.

## Gotchas

**It only sees flat literals.** Translucent values do not resolve, so any pair
involving one must score zero rather than be quietly skipped — skipping it makes
the audit look complete.

**Composited colour is out of reach entirely.** A translucent hover state over a
panel is a real background that real text sits on, and an alpha over a hex is not
a hex. Nothing in a source parse can reach it.

**A theme stated twice is a theme that can drift.** A palette expressed both
under a media query and under an explicit attribute is two blocks; an audit
reading one of them will not notice the day they disagree. Either read both or
say plainly that you do not.

**The pair list is a promise, not a discovery.** The audit checks what it was
told to check. A colour added without its pair is a colour that stopped being
audited, and nothing announces that.

## Used in

`flover-next` — the token section of the kitchen sink, computed at build time and
rendered into the static HTML.

## Related

[`two-tier-colour-tokens`](../patterns/two-tier-colour-tokens.md) — what makes
the `var()` chain worth walking.
