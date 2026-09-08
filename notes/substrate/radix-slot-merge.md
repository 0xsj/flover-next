# Slot's merge is asymmetric

Slot's merge is asymmetric on purpose: child props win, `className` and `style`
merge, and handlers compose child-first.

**True of `radix-ui` 1.6.7 · verified 2026-09-08**

## Origin

Building a composable button primitive, where a caller supplies the element and
the primitive lends it an appearance.

**Measured** for the parts a test can reach: that exactly one element renders with
no wrapper, that a caller's class survives alongside the primitive's, and that
both handlers run with the caller's first. The remaining resolution rules are
**read** from the library's behaviour and are not separately asserted here.

## What

`Slot` merges the props it is given onto the single child element it receives.
The merge resolves differently per prop kind:

- **most props** — the child's value wins
- **`className` and `style`** — merged rather than replaced
- **event handlers** — composed, the child's running first

`Slottable` marks which child receives the merged props when there is more than
one, so a wrapper's own content can render *inside* the child rather than beside
it.

## Why the asymmetry is the right default

Composition means the caller already has an element with intentions of its own. A
symmetric merge would make one side arbitrarily authoritative and the other side's
props conditional on not colliding.

Child-first for handlers is the important one: a caller attaching a handler to the
element it supplied never has it silently replaced by the wrapper's. The wrapper's
handler still runs, so both intentions survive.

## Example

A composition prop beats an `as` prop for this job. An `as` prop has to re-declare
the props of every element it can become, and still cannot express *render
whatever component the caller already has* — which is the case that actually
arises with a router's link component. Inverting it, so the caller brings the
element, sidesteps the whole problem.

## Gotchas

**Slot cannot remove a prop from the child.** Passing a prop as `undefined` does
not clear the child's — child props win, so the child keeps it. This is why
disabling a composed element cannot be done by unsetting its destination and has
to be done with an ARIA state, tab-order removal and suppressed pointer events.

**Those mitigations are incomplete and the gap is real.** They stop a click and
stop tabbing to it. They do not stop keyboard activation if something focuses the
element programmatically, and closing that gap needs a synthesised handler — which
a component that must render on a server cannot afford. The rule that follows is
behavioural, not technical: do not render a link you do not want followed.

**A wrapper that always attaches a handler is a wrapper that cannot render on a
server.** Function props do not cross that boundary, so a primitive that
manufactures one — even a no-op — becomes client-only and takes every page
rendering it with it.

## Used in

`flover-next` and `overwatch-ui` — the button primitive's composition branch in
both.

## Primary source

The library's `Slot` implementation and its documentation for the composition
prop. Re-check the handler composition order on a major upgrade; it is the part a
test here would catch.
