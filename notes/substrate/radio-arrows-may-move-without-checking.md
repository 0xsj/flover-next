# Radio arrows may move without checking

WORKING — a radio group's arrow keys are specified to move focus AND check, but
the implementation here does it through a listener that runs after the focus has
already moved, and in a headless DOM the option arrives focused and unchecked.

**True of `radix-ui` 1.6.7 · measured under `jsdom` 30, NOT verified in a
browser · 2026-09-09**

## Origin

**Measured, and it contradicted what I had already written.** The component doc
said "arrows select as they move" — the platform contract, and what the
primitive intends — and the test asserting it failed. Focus moved to the next
option; the checked option did not change.

## What was measured

Tab into the group, press ArrowRight:

```
  focus          moves to the next option
  aria-checked   unchanged — still on the option that was checked
  the effect     not applied
```

Pressing Space on the newly focused option checks it and applies it. So the
group behaves as *manual activation* here, not as selection-follows-focus.

## The mechanism, read from the source

The primitive wants to check on arrow-focus, and does it in two parts:

```
  a document-level keydown listener   sets "an arrow is down" on a ref
  the item's own focus handler        clicks itself if that ref is set
```

The roving-focus behaviour moves focus from the item's own key handler, which
runs while the event is still below `document` in the bubble path. So focus —
and therefore the focus handler — happens *before* the document listener sets
the flag, and the item sees `false`.

That ordering argument holds in a browser too, on the face of it, which is why
this note is WORKING rather than settled: the same reasoning predicts the same
result everywhere, and the primitive is widely used with the opposite reported
behaviour. One of those is wrong and it was not resolved here.

## What to do without settling it

**Design so it survives both.** If arrowing might leave an option focused but
unchecked, that state must be *visible* — a focus ring distinct from the checked
fill. A design whose checked state is the only visual state is broken under
manual activation and looks fine under automatic, which is the failure that
ships.

**Assert only the half that is settled.** A suite can pin "arrowing past an
option does not apply it" and "Space commits" without claiming which mode the
primitive is in. Asserting selection-follows-focus would pin the environment's
behaviour, not the component's.

**Do not remove the focus outline to tidy the control.** It is load-bearing here
and it looks like decoration.

## How to re-check when this ages

Open the group in a real browser, Tab in, press an arrow, and read
`aria-checked`. Two minutes, and it either settles this note or replaces it.

## Used in

`flover-next` and its two sibling templates — the segmented control shared by the
shell's preference toggles.

## Related

[`traversal-that-activates`](../techniques/traversal-that-activates.md) — the
same axis chosen deliberately rather than inherited,
[`probe-before-writing-a-weaker-assertion`](../techniques/probe-before-writing-a-weaker-assertion.md).
