# Hand the caller the wiring

When a component owns identifiers that a different element has to carry, the
only arrangement in which forgetting them is visible is handing them over as
named props.

## Origin

Building the component that owns a form control's label, description and error —
the three things around a control that must be connected to it by identifier.
Three arrangements were available and two of them fail silently.

## What

The children are a **function**, called with exactly the attributes the other
element must carry, already named as those attributes:

    id
    aria-describedby?
    aria-invalid?
    required?

so the caller spreads them and is finished. There is nothing to render without
first receiving them.

## Why the alternatives fail quietly

**Render the label and trust the caller.** The wiring lives in somebody's memory.
It is forgotten on the fourth form, not the first, and nothing says so.

**Take a node and inject props into it.** Reaching into a child to clone it and
add attributes works until somebody nests the control one level deeper — a
wrapper div for layout, a conditional, a small component of their own — and then
the injection lands on the wrapper. The form still renders. Everything still
looks right.

Both failures are invisible **to the person who introduced them**, which is the
property that makes this class of defect different from every other. A broken
layout is visible to its author; a broken label is not. The form renders, passes
a screenshot review, and is unusable with a screen reader.

A function argument cannot be lost the same way. It is not a guarantee — a
caller can still ignore what it was handed — but the mistake moves from
*invisible* to *visible*, and that is the honest claim to make for it.

## One control receives the wiring; a GROUP keeps it

The rule inverts the moment there is more than one control, and getting that
wrong is not a styling difference.

A description handed to one radio button of four is wrong three times, and is
announced only when that one happens to be focused. A label naming four radios
names none of them. So for a group the identifiers stay on the CONTAINER, the
container carries the description and the validity state, and the children are
plain nodes because there is nothing to hand down.

That is why these are two components rather than one with a flag — the
difference is not how they look, it is which element the attributes belong on.

The group's name is a `<legend>`, and it is not a heading that happens to look
different: it is announced before **every** control inside the group, which is
what makes the third option comprehensible when a reader reaches it. A styled
paragraph above the group reads as unrelated text and the options arrive
unattached to their question.

## Gotchas

**Absent, never false.** An aria attribute set to `"false"` is a different
announcement from no attribute at all, and the same is true of the visual state
attributes a stylesheet keys on. Build them as present-or-undefined.

**Order matters inside a description.** When both an error and a hint are
present, name the error first: a reader announces them in the order given and
the error is the more urgent.

**Style off the aria attribute, not a parallel class.** A control that announces
itself invalid should look invalid *because* it announced it. An `invalid` prop
that only sets a class is the silent-wiring-loss this whole shape exists to
prevent, reintroduced one layer down.

**A visual required mark is decoration.** Hide it from assistive technology —
the attribute on the control is the announcement, and hearing "star" after every
label is noise.

**Read-only is not disabled, and they must not look alike.** A read-only value
still matters — selectable, copyable, in the tab order. A disabled control is out
of play. Rendering them the same teaches people that greyed-out text cannot be
copied, and then they stop trying.

**Identifiers must come from the framework's own generator.** A module-scope
counter restarts per process on the server and continues on the client, so a
server render and its hydration disagree.

## Used in

`flover-next` and its two sibling templates — the form field primitive, whose
control receives its wiring rather than being reached into.

## Related

[`absence-is-a-value-not-a-failure`](../patterns/absence-is-a-value-not-a-failure.md)
— the same absent-rather-than-false discipline, one tier down.
