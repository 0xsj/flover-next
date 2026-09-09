# Index by the thing, not the argument

A reference index has to be organised by what is being referenced. Group it by
the point you want to make and the things themselves stop being findable.

## Origin

**Measured, and noticed by a person rather than a check.** A component gallery's
navigation is derived from the page, so it lists exactly what has an entry. Four
components were demonstrated inside a case named for the *story* they told
together — three states surviving into a table — and the result was four
components with **no entry in the navigation at all**. They were on the page,
fully built and tested, and unfindable by name.

Nothing failed. Every one of them rendered.

## What

One entry per thing. The exception, and it is narrow: two things share an entry
only when **neither can be demonstrated without the other** — a form field and
the control inside it, say. "These are related" is not the test; "this one
cannot be shown alone" is.

The argument belongs *inside* the entry, not in the index. A case named for a
component can still make a point about three of them; a case named for the point
makes its components disappear.

## Why the pull toward thematic grouping is strong and wrong

Because the person building it has just finished thinking about the theme. The
interesting thing they learned is the relationship, so the relationship becomes
the heading — and it reads beautifully to them, once, on the day they wrote it.

But a reference has two audiences and only one of them is on a tour. The other
arrived knowing the name of the thing they want, and for that reader an index
organised by insight is an index they have to read linearly to search. The index
IS the surface area: something absent from it does not exist to a reader, no
matter how completely it is built.

## Where two things really are only meaningful in comparison

Repeat the comparison; do not merge the entries.

Three controls that look alike and mean different things need that distinction
stated — but merging them into one entry named for the distinction costs each of
them its own name. Give each an entry and close each with the same comparison.
The repetition is cheap and it means the point is visible from whichever one the
reader happened to open, rather than only from an entry they would have to know
existed.

## Gotchas

**A derived index makes this visible; a hand-written one hides it.** When the
navigation is generated from what is actually on the page, a missing entry means
the thing has no case — an honest signal. A hand-maintained list can name
something that has no demonstration, and then the index is a promise rather than
a map.

**"We will split it later" does not happen.** A thematic case covering three
things reads as finished to the person who wrote it. It gets split when somebody
else cannot find something, which is later than it sounds.

**Ordering is not indexing.** Putting the entries in a sensible reading order is
fine. Removing entries so the order reads better is the failure.

## Used in

`flover-next` and its two sibling templates — the component gallery's rail,
after four components turned out to have no entry.

## Related

[`navigation-derived-from-the-page`](../patterns/navigation-derived-from-the-page.md)
— which is why the gap was visible at all.
