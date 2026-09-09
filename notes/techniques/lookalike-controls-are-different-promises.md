# Lookalike controls are different promises

Choosing between a checkbox, a switch and a toggle is not a styling decision —
each announces a different promise about what happens next, and the wrong one
tells a reader something untrue.

## Origin

Building the choice controls for a design system and noticing that three of them
are, visually, the same decision rendered differently — and that nothing in the
usual review catches a wrong pick, because the rendered page looks right in every
case.

## What

    checkbox   a VALUE being submitted. Nothing happens until the form does.
    switch     a SETTING. It takes effect on flip; there is no Save.
    toggle     a BUTTON that stays pressed. It changes the view, not the data.

    select     picks a VALUE. It has a current one, it is submitted, and
               reopening it shows what is chosen.
    menu       picks an ACTION. No value, nothing submitted, same list
               every time.

The pairs in each group are near-identical on screen and completely different
when announced — one as a checkbox, one as a switch, one as a pressed button;
one as a combobox carrying a value, one as a list of commands.

## Why picking by appearance is a lie rather than a mistake

A switch inside a form with a Save button promises an immediate effect the form
does not deliver. Somebody flips it, hears that it is on, navigates away, and
nothing was saved. Nothing in the interface said otherwise, because the control
itself was the claim.

A menu used to choose a value leaves a reader with no way to discover what is
currently selected — there is nowhere for a current value to live in that role.
A select used for actions announces a "current action", which is nonsense that a
sighted user never encounters.

These are not accessibility bugs in the sense of a missing label. The wiring is
present and correct; the *statement* is false.

## A role is also a keyboard contract

Picking a role inherits obligations beyond the announcement. A radio group's is
that Tab enters and leaves the whole group while arrows move within it — **one**
tab stop, not one per option. A hand-rolled group almost always gets this wrong
in the same direction, and a form with fifteen options then costs fifteen tab
presses to walk past.

Use the primitive that implements the contract, or implement all of it. Half of
a keyboard contract is worse than none, because it looks like it works.

## A ROW of them is a different promise again

The same mistake scales up, and at group level it is easier to make because the
individual controls are each defensible.

    three toggle buttons    three independent on/off states. A reader is told
                            there are three decisions here.
    one radio group         one decision with three answers, exactly one true.

A segmented control — theme, density, a view switch — is the second. Built as
the first, every option carries `aria-pressed`, the group costs three tab stops
instead of one, and nothing announces that choosing one un-chooses the others.

It renders identically. The give-away is in the source rather than on the
screen: if the code has to make sure exactly one is pressed, the control was a
single-select and said otherwise.

## Gotchas

**A switch with an asynchronous effect has no good loading state.** It will be
flipped back by a failure, and a spinner in the track does not explain that.
Make the surrounding region busy and surface the failure where failures go — a
control that silently reverts is worse than one that never moved.

**A toggle rendering only a glyph still needs a name.** The same rule as an
icon-only button, and it is usually not enforceable by the type when the props
are spread through from a primitive. Say that it is a review point rather than
implying the type covers it.

**"It looks the same" is the symptom, not the defence.** If two controls are
interchangeable visually, that is the argument for writing down which one means
what, not for treating the choice as cosmetic.

## Used in

`flover-next` and its two sibling templates — the choice controls in the forms
group.

## Related

[`a-state-is-not-a-variant`](a-state-is-not-a-variant.md),
[`hand-the-caller-the-wiring`](hand-the-caller-the-wiring.md).
