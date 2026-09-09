# An overlay borrows focus

An overlay's obligations are one obligation — it borrows focus and must give it
back — and every part of it breaks silently, in a way the person who broke it
cannot see.

## Origin

Deciding what an overlay group actually owes, given that the visual part is a
box with a shadow and takes an afternoon. The behaviour is the component.

## What

Four things, and they are one thing seen from four angles:

    focus moves IN when it opens        the borrow
    focus is TRAPPED while open         it stays borrowed
    Escape closes                       the borrower can always be dismissed
    focus RESTORED to the trigger       the return

Plus the page behind going inert and scroll being locked, which are the same
promise expressed for the pointer rather than the keyboard.

Miss the first and a keyboard user has opened something they are not in. Miss the
second and they tab out into a page they cannot see. Miss the fourth — the one
that actually breaks — and they are returned to the top of the document, having
lost their place entirely.

## Why the fourth is the one that breaks

Restoring focus requires the trigger to still exist. A dialog opened from a row
that the dialog's own action then removes, or from a parent that re-renders on
close, has nowhere to give focus back to — and the library cannot help, because
the element is gone.

It is also the only one nobody notices in a mouse-driven review. Opening and
closing something with a pointer never exercises it: the pointer is already
where it wants to be, and focus lands wherever it lands.

## A confirmation whose default is "yes" confirms itself

When an overlay's job is to interrupt a destructive action, focus goes to the
CANCEL. Focus on the destructive button turns an interruption into a formality —
a keyboard user's habitual Enter commits the thing the dialog existed to
question.

The same shape: no dismissal by clicking outside, because a stray click is not a
decision.

## Gotchas

**A hint that requires hovering may never carry the only copy of anything.** It
is unreachable by touch and by anyone who does not hover — if the content is a
control it belongs in something focusable, and if it is the trigger's name it
belongs in the trigger.

**Distinguish the overlay that CAN be dismissed from the one that must be
answered.** They look identical and promise different things; the dismissible
one gets a close control and outside-click, the other gets neither and a
required description saying what it is asking.

**One elevated surface, shared.** Four overlays styled independently become four
shadows and three border colours, and nobody notices until they are on screen
together.

**Test all of it or say which part you did not.** This is the group where
"looks right" is furthest from "is right".

## Used in

`flover-next` and its two sibling templates — the overlay group, whose four
obligations are asserted rather than described.

## Related

[`probe-before-writing-a-weaker-assertion`](probe-before-writing-a-weaker-assertion.md),
[`lookalike-controls-are-different-promises`](lookalike-controls-are-different-promises.md).
