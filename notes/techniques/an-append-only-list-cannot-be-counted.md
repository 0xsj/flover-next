# An append-only list cannot be counted

A log that grows at the head breaks three things people reach for by reflex —
page numbers, a total, and facet counts computed from what is on screen — and
each of them looks like a nicety right up to the moment it traps a reader.

## Origin

Carrying an audit-log design across from an older build rather than inventing
one, and finding that its three least conventional decisions were the three
load-bearing ones.

## Offset pagination is wrong, not merely worse

New entries arrive at the head, so the offsets move under the reader. A request
for page two, a second later, **re-shows rows that moved down and hides the ones
that took their place.** Not a stale page — a wrong one, silently.

A cursor is the only correct answer, and it has to be **opaque**: it is an index
today and a keyset the day the server gets serious. A caller that parses it
breaks when the server improves.

Two rules follow:

    `next` is ABSENT when there is no more   — not empty, not null. A caller
                                              draws "load more" from a key being
                                              there, and an absence has to be a
                                              real absence
    an unreadable cursor is page ONE        — a stale bookmark should show the
                                              top of the list, not a failure
                                              screen. It is not the reader's
                                              fault

## There is no total, and there should not be

Counting an append-only log is a full scan whose answer is stale before it
renders. So no *"showing 1–50 of 1,284"* — and the honest render of a number
nobody computed is a dash, never a zero.

This is the one that gets argued about, because a total feels free. It is free
on a table of forty rows and it is a scan on a log, and the UI does not know
which one it is looking at.

## Facet counts must ignore the facet filter

The rule that keeps a reader able to get out of where they went.

    counted over the WHOLE set   every other facet keeps its real count, so
                                 there is always a way back
    counted over the filter      every other bucket reads zero, and a UI that
                                 hides empty facets has just removed the exit

So the counts arrive from the server and are rendered **as given**. Recomputing
them from the visible rows is the same bug with extra steps.

They also describe the whole set, so they do not change as you page — send them
with the first page only. **Absent on a later page means *keep the ones you
have*, never *there are none*.**

## Gotchas

**The filter belongs in the cache key.** Two filters are two lists; sharing a key
shows the previous filter's rows until the refetch lands, which reads as a slow
server rather than as a key that was too coarse.

**An unknown filter is an empty page and a success.** Not a 404. A stale bookmark
shows nothing rather than an error, and *looked and found nothing* stays a
different fact from *nobody looked*.

**Rows that record who did something need an actor that can be nobody.** A
refused sign-in is performed by an unauthenticated request, and naming the
account it was aimed at puts a name on an act that account did not perform.
Render it as words — *not signed in* — never blank, and never the account's own
name.

## Used in

`flover-next` and its two sibling templates — the activity screen and the ledger
service behind it.

## Related

[`three-states-die-at-the-render`](three-states-die-at-the-render.md),
[`absence-is-a-value-not-a-failure`](../patterns/absence-is-a-value-not-a-failure.md).
