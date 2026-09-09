# A portal splits the two trees

A portal moves an element's DOM parent and leaves its framework parent alone, so
half of what "parent" means follows it and half stays behind — and which half is
which surprises people in both directions.

## Origin

Building a portal wrapper and asking what its documentation actually owes a
reader, given that the API is one prop and the behaviour is entirely in what
stops working.

## What moves and what does not

```
  follows the FRAMEWORK tree      context · synthetic events · state ownership
                                  · unmount when the renderer unmounts
  follows the DOM tree            CSS inheritance and containment · native
                                  listeners · document order for a reader
                                  · anything selecting by ancestor
```

Two consequences people meet in the wrong order.

**A click inside the portal still reaches a handler on the component that
rendered it**, even though that component is no longer a DOM ancestor. Framework
events are dispatched along the framework tree. So the outside-click detection
you wrote as "did this land inside my subtree" reports *inside* for something
rendered at the end of `<body>`.

**A native listener on the old parent stops firing**, because native events know
only the DOM. Mixing the two in one component gives you a handler that fires and
a handler that does not, for the same click.

## Why you reach for one, and why rarely

The reason is always containment, never layout preference: an ancestor that
clips (`overflow: hidden`) or that becomes the containing block for fixed
positioning (any `transform`, `filter`, `will-change`). Inside one of those, no
amount of `z-index` or `position: fixed` gets the element out.

That is a narrow set of cases, and in a component system most of them are
already handled — every overlay portals itself. A portal in application code is
usually a symptom of a wrapper that should have done it.

## It renders nothing on the server

**Measured** (a mount-gated implementation): server HTML and the first client
render are both empty, and content appears on the second. The gate is deliberate
— there is no document to target during server rendering — but the consequence
belongs to whoever uses it:

    no first-paint content in a portal
    nothing indexable in a portal
    no layout that assumes it is there before hydration

## Gotchas

**A reader meets the content where the DOM puts it**, not where it was written.
Content portalled to the end of the body is at the end of the document unless
something moves focus there or names it from where it belongs — which is most of
what an overlay's machinery is doing.

**Styling by ancestor stops working**, including inherited custom properties from
a themed subtree. A portal into `document.body` leaves any scoped theme behind.

**Stacking context is not inherited either**, so an element that escaped one
clipping ancestor can land inside a different stacking context and be hidden by
something new.

## Used in

`flover-next` and its two sibling templates — the portal in the utility group,
whose demonstration is a click counter on the clipping ancestor that keeps
counting after the content leaves.

## Related

[`an-overlay-borrows-focus`](an-overlay-borrows-focus.md).
