# A comment is a missing union

Whether a shape needs a discriminated union is decided by whether its fields are
correlated or independent — and the most reliable signal that they are
correlated is that somebody wrote a comment saying so.

## Origin

**Measured.** Comparing a form-state type against the one an older build of the
same idea had used. Mine was four optional fields; theirs was a tagged union
with a second tag on the error arm. Mine carried this comment:

    /** Keyed by the input's name. Only `invalid` produces these. */
    fields?: Record<string, string>;

*Only X produces these* is an invariant. It was written in prose because the
type could not hold it, and the reason it was written at all is that the author
knew it and knew the type did not.

## The test

Not "is this a state machine" — that framing is too grand and you will
under-apply it. The question is narrower and answerable in a second:

> **Do these fields vary independently, or are they correlated?**

    independent   optional fields are correct
    correlated    a union, tagged

Correlated means one field's presence tells you something about another's. In
the form state above, `fields` being present meant the message was field-scoped;
both present was meaningless, neither present was meaningless, and both compiled.

## The tell, and it is greppable

Any of these in a doc comment, beside an optional field:

    only present when …          absent unless …
    ignored if …                 only X produces these
    required when … is set       null when … is absent

Also: a pair of booleans that cannot both be true, a field only ever read inside
one `if`, and a test that has to assert something is `undefined`.

## The counter-example matters as much as the rule

Over-applying this is a real cost, so keep a clear example of when optional
fields are right. Two shapes that look identical and are not:

**A set of independent modifiers.** A fault-injection effect —
`{ fail?, empty?, latency?, hang? }` — where several deliberately apply at once.
Nothing about one tells you anything about another. A union here would be wrong
and would need a product type to say what it already says.

**A filter.** `{ query?, facet?, sort?, cursor? }`. Same reasoning. Absent means
unset, and every combination is legal.

If you cannot name a pair whose presence is correlated, you do not have a union.

## Where they turn up, roughly in the order they arrive

    a settled read          found · empty · UNMEASURED — and "nobody looked" is
                            the arm that gets dropped
    a read in flight        the above plus loading, which is a FOURTH state and
                            not a boolean beside the other three
    a submitted form        idle · ok · error(form) · error(fields)
    a permission            allowed · denied{reason} — a boolean throws away the
                            reason, and three reasons need three screens
    an identity             more arms than signed-in/out the moment there is
                            verification, a second factor, or a suspension. The
                            union where a boolean does the most harm, because
                            the wrong branch is a security decision
    a multi-step form       step 2's data does not exist during step 1
    an upload               progress exists only while uploading

## Gotchas

**Nested tags are fine when there are two independent questions.** *Did it fail*
and *where does the message go* are separate, so tagging on the first and again
on the second beats flattening into six top-level variants.

**It costs readability at the call site, and pretending otherwise is how the
pattern gets a bad name.** Checking two tags is more verbose than an optional
chain. Pay it when the value crosses a boundary, has more than one reader, or
when getting it wrong is silent. Local state with one reader and no invariant is
ceremony.

**A union does not have to be exhaustive on day one.** An arm nobody constructs
is a modelled state with no caller. Leave it out and write down the trigger for
adding it.

## Used in

`flover-next` and its two sibling templates — the settled-read type, the failure
union, and the form state a server function returns.

## Related

[`three-states-die-at-the-render`](three-states-die-at-the-render.md) — the same
failure at the render rather than in the type,
[`absence-is-a-value-not-a-failure`](../patterns/absence-is-a-value-not-a-failure.md).
