# The first paint happens before your code

Anything that has to be true of the first frame cannot be decided by the
component that renders it, which forces a second copy of the logic into
something that runs earlier — and that copy, not the script, is the real cost.

## Origin

**Measured.** A theme control, correct in every other respect, that gave a user
who had chosen dark a light first paint and then a jump. The control was not
wrong; by the time it mounted, the page had already been painted once.

## The sequence, which nothing in the component can shorten

```
  server renders    no storage, no preference — it renders the DEFAULT
  html arrives      browser paints it. This frame is already wrong
  bundle loads
  component mounts
  effect reads storage
  attribute set     browser repaints. The user saw the jump
```

Reading the preference during render instead is not the fix — the server has no
storage, so it is a hydration mismatch, which trades a visible flash for a
console error and a second render that does the same thing.

The gap is between *html arrives* and *bundle loads*, and nothing that ships in
the bundle can be inside it.

## The shape of the fix, and why it must be a string

A small blocking script, inline, first thing in the body. It runs during parsing
and before the first paint, so the attribute is already correct when the browser
paints.

It cannot `import` anything, because the whole point is that it runs without the
module system. So it is **source text** that the shell injects, not a module
the shell calls. That is what makes it awkward and it is not avoidable.

The consequence is a duplicate: two places now know the storage key, the
attribute name and the set of valid values.

## Making the duplication loud

Irreducible duplication can still be made to fail noisily, and this is the
transferable part:

> Run both paths against the same input and require the same output.

Set up the storage; execute the script; record the document. Reset; set up the
same storage; call the module path; record the document. Assert they are equal —
across the defaults, the non-defaults, and a value left over from an older build.

Without that, the drift is silent and its symptom is a flash, which reads as a
framework problem rather than as two files disagreeing about a string.

## Make the default the ABSENCE of state

The single design choice that makes the early script small enough to trust. If
the default is expressed by *not setting the attribute* rather than by setting
it to `"default"`, then:

- the server's ignorant render is already correct
- the script only ever writes the non-default values
- it never has to remove anything, because a fresh document has nothing to remove
- and a stylesheet's media-query fallback takes over on its own

The alternative — a sentinel value written into the DOM — means the early script
has to clear state as well as set it, and a media query that was meant to handle
the unset case now matches nothing.

## Gotchas

**It will be reported as a hydration mismatch, and that is expected.** The
script exists to make the document differ from what the server sent, and a
framework that compares the two says so — on the element the script wrote to,
which is usually the root and usually the one element the framework cannot
re-render. Opt that element out of the comparison and nothing else: a
suppression that reaches children is a suppression that hides real mismatches
for the life of the project, and it will be added by whoever meets this warning
first and reaches for the biggest hammer that silences it.

**Wrap it in try/catch and let it do nothing.** Storage throws outright in some
privacy modes. A preference is not worth an exception, and this code runs before
any error handling exists.

**Keep it readable in view-source.** It is the one piece of the application a
user can inspect without tooling, and the one nothing else can test at runtime.

**It is the place a content-security-policy bites.** An inline script needs a
nonce or a hash under a strict policy, and that is a deployment fact rather than
a code one.

**This is not only themes.** Anything stored client-side whose default is wrong
for some users has the identical problem: density, locale, reduced motion, a
layout flag. The same script grows to hold them — which is the argument for the
agreement test rather than against the pattern.

## Used in

`flover-next` and its two sibling templates — the runtime tier's boot script and
the agreement test that pins it to the module path.

## Related

[`three-states-die-at-the-render`](three-states-die-at-the-render.md),
[`negative-controls-catch-the-harness`](negative-controls-catch-the-harness.md).
