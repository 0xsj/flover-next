# A cloning wrapper demands a cooperating child

A wrapper that works by adding props to its child is making a requirement of
that child which its type does not express — and when the child ignores them,
nothing fails except the thing the wrapper existed to guarantee.

## Origin

**Measured.** Testing a wrapper whose job is to hide an icon from assistive
technology and give it a name. The test rendered a stand-in — a two-line
component returning an `<svg>` — and asserted the icon carried the hiding
attribute. It did not.

The wrapper was correct. The stand-in accepted no props and forwarded none, so
both attributes were handed to a function that dropped them. The result is an
icon that is announced AND a name that is announced: the exact defect the
component prevents, arrived at through the component.

## What

Composition by cloning is a contract between two parties where only one of them
has signed anything.

    the wrapper says     I will add these props to whatever you give me
    the child must       forward unknown props to the element it renders
    the type says        children: ReactNode

Nothing in that type mentions forwarding. A component that renders a fixed
element and takes no props satisfies it perfectly and silently defeats it.

The same shape appears wherever a parent reaches into a child instead of
rendering around it — prop cloning, slot merging, a render-prop that hands down
attributes. It is not a React idiom problem; it is what "reaching in" costs.

## Two demands, and only one can be typed

**Exactly one child** is expressible: type it as a single element rather than as
arbitrary nodes, and two children stop compiling instead of throwing at runtime.
Worth doing — it converts the library's runtime guard into a type error.

**A child that forwards its props** is not. Any element type satisfies the
signature; whether it spreads what it is given is a property of its body.

So the second demand has to be met somewhere else:

    use it with elements you control, or with library components that spread
    assert the RESULT, never the wiring — query the rendered element for the
      attribute, and the swallowed case fails
    say it in the doc, because the compiler will not

## Why the silent case is the bad one

A wrapper that throws when misused is a wrapper that taught somebody something.
This one renders, looks right, and produces a page that is worse than the one
without it — because a reviewer sees the wrapper in the source and stops asking.

The failure is also invisible in exactly the review that would catch anything
visual, since the entire component operates on the accessibility tree.

## Gotchas

**A hand-written stand-in in a test is the likeliest offender**, and it makes the
test fail against working code — which points the investigation at the wrapper.
Test with the real thing.

**Cloning overwrites rather than merges.** A child that already sets the attribute
being added is fine; a child that sets a *conflicting* one loses silently, in
whichever direction the library chose.

**Check the merge direction before relying on it.** Whether the wrapper's props
or the child's win is a library decision and it is rarely the same for
`className` and `style` as for everything else.

## Used in

`flover-next` and its two sibling templates — the icon-naming wrapper in the
utility group, and its test, which renders a real icon for this reason.

## Related

[`radix-slot-merge`](../substrate/radix-slot-merge.md),
[`hand-the-caller-the-wiring`](hand-the-caller-the-wiring.md).
