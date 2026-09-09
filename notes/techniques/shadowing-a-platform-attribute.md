# Shadowing a platform attribute

When a design system's vocabulary collides with the platform's, shadow the
platform name rather than inventing a second one — but only where the platform's
meaning is one nobody wants, and say so where it happens.

## Origin

Giving a text input a `size` prop for the control-height scale, matching every
other primitive in the system. The platform already has `size` on an input, and
it means *width in characters*.

## What

Two ways out, and both are defensible:

    rename yours     `controlSize`, `scale`, `height`
    shadow theirs    omit the platform prop from the type and reuse the name

Shadow when the platform's meaning is one that is almost never wanted, and the
consistency of your own vocabulary is worth more. Rename when the platform's
meaning is genuinely useful and a caller will need both.

Character-width is a layout decision expressed in the wrong unit, in a
typographic measure nobody reasons in, on a property that CSS handles better. So
it is the first case. A caller who genuinely wants it sets a width in CSS, where
widths belong.

## Why the choice has to be deliberate

The failure is not picking wrong — it is picking by accident. A prop type that
spreads the platform's attributes and adds a `size` variant of its own produces
a type collision the compiler reports in terms nobody can act on, and the usual
response is a cast.

Doing it on purpose means one line in the type, omitting the platform prop, and
one paragraph saying which meaning survived. The paragraph matters more than the
line: the next person to read `size="sm"` on an input has every reason to assume
it is the platform's, because it always was.

## The same rule applies to a library's defaults

A wrapper that quietly flips a default is the same failure one layer out.
Somebody reads the library's documentation, learns that a value defaults one
way, and gets the other — with no indication that anything intervened, because
the wrapper's name is not the library's.

Keep the underlying default and document the choice, or change it and say so at
the point of use. The tempting third option, changing it because the new default
is "more usually what you want", is how a wrapper becomes a thing you have to
read the source of.

## Gotchas

**Only shadow a name whose platform meaning you are removing entirely.** Leaving
both reachable — yours as a prop, theirs as a pass-through — gives one identifier
two meanings depending on where it appears, which is worse than either.

**Check what else the attribute does.** A shadowed name is a name you have
opted out of, so anything the platform builds on it goes too. Weigh that before,
not when somebody asks for it.

**Do not shadow a name the accessibility layer reads.** Appearance vocabulary is
fair game; anything with semantics attached is not, and the rule of thumb is
that if a reader announces it, it is not yours to redefine.

## Used in

`flover-next` and its two sibling templates — the text input's size scale.

## Related

[`hand-the-caller-the-wiring`](hand-the-caller-the-wiring.md).
