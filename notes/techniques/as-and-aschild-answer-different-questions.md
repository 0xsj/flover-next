# `as` and `asChild` answer different questions

Which of the two a component should take is decided by who owns the CONTENT, not
by which is more flexible — and a component whose content is its whole point
cannot use the flexible one.

## Origin

A wordmark, in a system where every other composable component takes `asChild`,
and where taking `asChild` here would have meant typing the product's name at
every call site.

## What

    asChild    the caller supplies the ELEMENT and its CONTENT.
               The component lends appearance or behaviour to something the
               caller already has. Adds no wrapper.

    as         the component supplies the CONTENT. The caller supplies only the
               tag, because the tag is a fact about the document and not about
               the component.

They look interchangeable and are not, and the test is one question: *if the
caller has to write the content, has the component lost its reason to exist?*
For a button, no — the label was always the caller's. For a wordmark, yes: the
spelling and the casing are the entire job, and `asChild` reintroduces the
duplication the component was created to end.

## Why the element is a prop at all

Because the document outline is a property of the page, not of the component.

The same wordmark is the `h1` on a landing page — it IS the page's heading — and
a `span` in an application header, where a heading would be a lie. A component
that hard-codes either one gives some document two `h1`s and another none, and
**nothing in a visual review shows which**, because both render identical
letters in identical positions.

That generalises past wordmarks: any component that renders text which is
*sometimes* the heading of its context has this problem — a card title, a
section label, a panel's name.

## Keep the list closed

`as?: "span" | "h1" | "h2"` rather than any intrinsic element. Three cases exist;
an open list is the route by which a component becomes a styled div, and it also
destroys prop typing — the accepted props now depend on a value.

If a fourth case turns up, adding it is one character and a conversation. That
conversation is the feature.

## Gotchas

**Do not offer both.** A component taking `as` and `asChild` has two answers to
"what element is this" and they can disagree in the same call.

**`asChild` hands you a merge you did not write.** Which side wins for
`className`, `style` and event handlers is the primitive's decision, and it is
rarely uniform across them — know it before relying on it.

**`as` does not compose.** It cannot render a `Link`, or anything that needs its
own props, without the prop types collapsing. That is the boundary: the moment a
caller wants to pass an element rather than name one, the answer was `asChild`
and the content was theirs after all.

## Used in

`flover-next` and its two sibling templates — the wordmark in the shell group,
the one component in the system that takes `as`.

## Related

[`radix-slot-merge`](../substrate/radix-slot-merge.md),
[`hand-the-caller-the-wiring`](hand-the-caller-the-wiring.md),
[`composition-outlasts-configuration`](composition-outlasts-configuration.md).
