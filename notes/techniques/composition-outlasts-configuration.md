# Composition outlasts configuration

A component configured by data is a bet that the data is the only thing that
varies, and the bet is lost the first time one cell needs a link.

## Origin

Choosing between a table taking `columns` and `rows` and one built from row and
cell components. The configured version is shorter at the first call site and
was rejected anyway, on what happens at the fourth.

## What

    configured    <Table columns={cols} rows={rows} />
    composed      <Table><Row><Cell>…</Cell></Row></Table>

The configured form is genuinely shorter until a cell needs to be something
other than a string. Then it grows a `render` on the column. Then a
`headerRender`. Then `cellClassName`, then `rowKey`, then `onRowClick`, then a
way to span two columns — and each addition is a small re-invention of markup
the platform already has, expressed as configuration that only this component
understands.

The composed form costs a few more lines immediately and does not have a fourth
step, because the extension point is the language rather than the props.

## Why the trade reads backwards at first

The comparison people make is the first call site, where configuration wins
clearly. The comparison that matters is the *last* one, and by then the
configured component has an API surface nobody can hold in their head and a set
of render props that are composition with worse ergonomics and no type safety.

There is also a boundary effect: a configured component must know about
everything its cells might contain, so it accumulates imports — a link, a badge,
a status renderer — and stops being a primitive.

## When configuration IS right

When the shape genuinely cannot vary: a set of radio options, a breadcrumb trail,
a tab list. The test is whether a caller could ever want a *different kind of
thing* in one slot. If yes, compose. If the answer is honestly no and always no,
configuration is less to type and less to read.

## Gotchas

**A render prop is the tell.** The first one added to a configured component is
the signal that the shape varies after all, and the cheapest moment to switch is
right then — before three more arrive and a migration has call sites to rewrite.

**Composition needs the container to keep behaviour.** Scroll containment,
sticky headers, alignment rules and keyboard contracts belong to the wrapper, not
to each caller. Composed does not mean unopinionated.

## Used in

`flover-next` and its two sibling templates — the table primitive in the display
group.

## Related

[`hand-the-caller-the-wiring`](hand-the-caller-the-wiring.md) — the same
instinct, applied to attributes rather than to structure.
