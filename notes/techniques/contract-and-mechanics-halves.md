# Contract and mechanics halves

A specification that doubles as design rationale must be split by section, not by
sentence, or sanitising it later is a judgement call at the worst moment to make
one.

## Origin

Writing the first component specification, with the intention that it serve as a
spec-test oracle. The requirement was that the document describe *both* what the
component promises *and* which libraries satisfy it — and those are opposite
things to a test writer.

## What

One document, two labelled regions, in this order:

- **Contract.** What a caller may depend on and a black-box test may assert.
  Names no library, describes no internal structure, contains no code.
- **Mechanics.** How the contract is satisfied. Libraries, merge semantics,
  why the losing alternative lost.

A banner marks the boundary, and it is the only thing a sanitising step needs to
find.

## Why

A spec-test procedure hands the oracle to a writer that must not see the
implementation, so the implementation-shaped parts have to come out first. Done
by grep after the fact, that is a per-paragraph judgement about whether a
sentence leaks — made under time pressure, by someone who already knows the
answer, which is exactly the condition under which leaks get waved through.

Done by section, it is `sed -n '<start>,<end>p'`. The judgement moves to
authoring time, when the material is in front of you and nothing is riding on it.

The alternative that lost: **two files**, a `spec` and a `notes`. It sanitises
just as cleanly and it was rejected because the two halves drift. The mechanics
half is where you record that a rule exists *because* of a specific failure, and
that reasoning belongs next to the rule it justifies, in the file people open.

## Example

The boundary is a banner and the cut is a line range:

```
  § CONTRACT   ── everything from here is the oracle
  § MECHANICS  ── strip below this line before handing it to a writer
```

Verify the cut rather than trusting it. Grepping the contract range for library
names, code fences and braces should return nothing — and when it returns
something, check whether it is a false positive before editing, because English
words collide with library names.

## Gotchas

**A range extractor will close early on a self-reference.** The contract banner
naturally says "everything from here to § MECHANICS", which an `awk '/A/,/B/'`
range treats as the terminator. Cut on line numbers found separately, or on a
marker that appears exactly once.

**Public API names are contract, not mechanics.** A prop whose name comes from a
library — the composition prop that lets a caller supply the element — belongs in
the contract half, because callers type it. What belongs below the line is which
library implements it and how its merge resolves.

**Naming a framework concept is usually not a leak.** Saying a rule exists
because a certain construct cannot cross a server boundary tells a black-box
writer nothing it can use to snapshot the implementation. Code fragments are the
real leak; a justification is not.

## Used in

`flover-next` — every component `doc.ts`, starting with the button primitive.
The split is what its testing decision record depends on.

## Related

[`audit-the-source-not-the-render`](audit-the-source-not-the-render.md) — the
other half of verifying something without running it.
