# A state is not a variant

A variant is chosen by the author and a state comes from the data — so a state
belongs on the element where the platform can see it, never in a prop that only
sets a class.

## Origin

Deciding how a checkbox should express its third state. The obvious API is a
`mixed` prop beside `checked`, which reads well and is wrong: it makes an
author's choice out of something the data decides.

## What

Two categories, and the test is *who decides*:

    VARIANT   the author decides, at the call site, and it does not change
              size · intent · shape · tone

    STATE     the data decides, and it changes while the thing is on screen
              checked · indeterminate · pressed · expanded · highlighted
              busy · invalid · disabled

A variant is a prop that picks a class. A state is written to the element as an
attribute the platform understands, and **the styling reads that attribute**:

    .control[data-state="on"]      not  .control.isOn
    .input[aria-invalid]           not  .input.invalid

## Why it matters more than it sounds

Once a state is a prop that only sets a class, there are two sources of truth
and nothing keeps them equal. A control can look pressed without reporting that
it is pressed. That defect is invisible to the person who introduced it — the
page looks correct — and it is discovered by somebody who cannot see the page.

Reading the attribute makes the two the same fact. There is no way to have the
appearance without the announcement, because there is only one thing.

It also removes a whole category of prop. Both glyphs of a tri-state indicator
can live in the markup with the attribute deciding which shows, rather than the
component branching on a prop it was handed.

## Gotchas

**`:hover` alone is a state you have implemented for half your users.** A list
whose highlight is only a hover rule leaves a keyboard user with no idea where
they are — and that is invisible to anyone testing with a mouse. Use whatever
attribute the primitive sets for both, and style that.

**Absent, never false.** An attribute set to `"false"` is a different
announcement from no attribute, and a stylesheet keying on presence will match
`"false"` happily. Build them as present-or-undefined.

**Disabled is a state that some elements cannot carry.** Where the native
attribute does not apply, the mitigation is an aria state plus removal from the
tab order plus suppressed pointer events — and it is incomplete. Record what it
does not cover rather than implying parity.

**A variant that starts changing at runtime has become a state.** That is a
signal to move it, not to add a `useState` beside it.

## Used in

`flover-next` and its two sibling templates — every control whose appearance
follows a reported state rather than a prop.

## Related

[`lookalike-controls-are-different-promises`](lookalike-controls-are-different-promises.md),
[`hand-the-caller-the-wiring`](hand-the-caller-the-wiring.md).
