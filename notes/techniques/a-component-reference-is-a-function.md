# A component reference is a function

What may cross into a client component is decided by whether it serialises, and
the values people forget are the ones that do not look like functions — an icon
sitting in a configuration object is a function.

## Origin

**Twice, in the same project.** The first was obvious in hindsight: an
`onDismiss` handed down from a server component. The second was not:

    const NAV = [{ href: "/app", label: "Overview", icon: LayoutGrid }]

    Functions cannot be passed directly to Client Components
      {$$typeof: …, render: function Settings}

`icon` reads as data. It is a component, a component is a function, and the
array was a prop on a client component. Nothing about the call site looked like
passing a callback.

## What crosses and what does not

    crosses      plain data · elements already rendered · a "use server"
                 function, because what travels is a REFERENCE the runtime
                 knows how to call, not the function itself
    does not     any other function · a component reference · a class instance
                 with methods · anything holding a closure

The third row of the first column is the one that makes this subtle: a server
action and an event handler are both functions at the call site and only one of
them works. So "no functions" is the wrong mental model. The rule is *does the
runtime know how to send this*, and it knows about exactly one kind of function.

## The fix is almost always to stop passing it

Static configuration a client component needs should be **imported by it**, not
handed to it. Then it is bundled on the client and never crosses anything.

Ask what the prop was buying. In the case above: nothing. The nav is a constant,
the parent had no say in it, and the prop existed only because passing data down
is the habit. Removing it removed the boundary.

When a parent genuinely does decide, pass something that serialises — a key into
a registry the client owns, or the already-rendered element rather than the
component that renders it.

## Why it took two screens to notice

The defect is a runtime error at render, and **the screen was behind an
authentication guard**. A production build renders nothing dynamic, so it
compiled clean; no test rendered the layout; and the only way to meet it was to
sign in and look.

That generalises past this bug: **whatever is behind a guard is rendered by
nobody in CI.** A build's route table showing a screen as dynamic is also a list
of the screens nothing has ever executed.

## Gotchas

**A class instance loses its methods, not its data.** It arrives as a plain
object that passes a shape check and fails on the first call — which is why a
result type that is a class must be unwrapped before it crosses at all.

**An element is not a component.** `<Icon />` crosses; `Icon` does not. That is
the whole difference and it is one character.

**The error names the component**, in the `render: function X` line. Grep for X
in whatever the parent passed down; it is faster than reading the stack.

## Used in

`flover-next` and its two sibling templates — the shell's navigation, which
imports its own configuration for this reason.

## Related

[`value-inward-exception-at-the-edge`](../patterns/value-inward-exception-at-the-edge.md),
[`composition-outlasts-configuration`](composition-outlasts-configuration.md).
