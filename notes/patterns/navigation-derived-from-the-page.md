# Navigation derived from the page

A navigation read from the rendered DOM cannot list something that is not there,
which is a property a hand-kept list can only promise.

## Origin

Building a component gallery with two navigations — a section bar and a per-case
rail. The rail would have been a second hand-kept list of every case on the page,
which is precisely the drift the section registry existed to prevent.

## What

Two levels, and they are derived differently on purpose.

- **Sections** come from a registry the page also composes from. One list, two
  readers, so a section cannot exist and be unreachable.
- **Cases** are not listed anywhere. The frame component stamps a data attribute
  and an id derived from its own visible title, and the rail queries the DOM for
  them.

The active entry comes from an intersection observer whose band is pinned near the
top of the viewport, so the highlight follows what is being read rather than
whatever happens to be centred.

## Why

The registry solves the problem one level up and stops there. At the level below
it there are many more entries, they change more often, and a parallel list would
be maintained by whoever remembers — which is the failure the registry was built
to avoid, reintroduced at a level where it is more likely.

Reading the DOM inverts it. The rendered page is the source of truth, so a case
that renders is reachable and a case that does not is absent from both. There is
no state to keep in sync because there is no second copy.

The id being derived from the visible title matters as much as the query: a
hand-written id can disagree with the heading above it, and then the anchor works
while the label lies.

## Example

The rail's subscription must return a **primitive** snapshot — a joined string of
the ids — not the structured entries. A fresh array from a snapshot function is a
fresh identity, which reads as a change on every call and loops forever. Derive
the structure from the key separately. See
[`stable-key-from-unstable-data`](../techniques/stable-key-from-unstable-data.md).

## Gotchas

**It renders empty on the server.** There is no DOM to read, so the server
snapshot is empty and the rail fills on mount. That is correct and it means the
rail is not in the prerendered HTML — worth knowing before concluding it is
broken.

**Document order is the only order.** The rail cannot express an order different
from the page, which is a feature until somebody wants a curated one.

**It observes mutations, so it survives content arriving late** — but an
observer on the whole body is a blunt instrument, and it is the thing to look at
first if the page gets expensive.

## Used in

`flover-next` and `overwatch-ui` — the component gallery in both.

## Related

[`stable-key-from-unstable-data`](../techniques/stable-key-from-unstable-data.md).
