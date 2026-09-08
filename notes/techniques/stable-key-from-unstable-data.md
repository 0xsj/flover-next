# A stable key from unstable data

A value derived fresh on every render cannot be a change signal, and the fix is to
derive a primitive key from it rather than to memoise the derivation.

## Origin

Measured, twice in one sitting. A hook took a token list as its dependency; the
caller built that list with `flatMap`, so it was a new array every render. The
symptom was `Maximum update depth exceeded` pointing at the `setState` line —
inside the hook, several files away from the `flatMap` that actually caused it.

The second occurrence was in a DOM-subscribing hook, where the same shape returns
a fresh array from the snapshot function and the store treats each call as a
change.

## What

When something unstable — an array, an object, a freshly-built list — is used to
decide *whether something changed*, reduce it to a primitive first and compare
that. A joined string of the names is stable across renders and still changes
when the set genuinely changes.

## Why

Change detection here is identity comparison. A fresh allocation is never equal to
the previous one, so "did this change" answers yes forever, and anything that
reacts by re-rendering closes the loop.

The instinct is to memoise at the call site. That works and it is fragile: it puts
the correctness of the hook in the hands of every caller, and the failure is
silent until it is catastrophic. Deriving the key *inside* the consumer makes the
hook correct regardless of how carelessly it is called.

## Example

Take the primitive at the boundary, and reconstruct inside:

```
  key   = names.join(",")            // stable, comparable
  effect(() => { … }, [key])         // rebuild what you need from key
```

The same rule in a subscription: the snapshot function returns the joined string,
and the structured value is derived from that key separately.

## Gotchas

**The error blames the wrong file.** It points at the state update, which is in
the consumer; the allocation is in the caller. Reading the stack alone sends you
to fix a hook that is not wrong.

**A linter will not catch it.** An exhaustive-dependencies rule is satisfied — the
dependency *is* declared. The rule checks that you listed it, not that it is
stable.

**Memoising the array is a second fix, not a better one.** It leaves the hook
depending on caller discipline.

## Used in

`flover-next` — the kitchen sink's token resolver and its DOM-derived navigation.

## Related

[`navigation-derived-from-the-page`](../patterns/navigation-derived-from-the-page.md)
— where the second occurrence lives.
