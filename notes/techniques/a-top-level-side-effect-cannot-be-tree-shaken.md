# A top-level side effect cannot be tree-shaken

A module that does something when it is imported is retained whole, however
little of it you use — which is how a server-only fixture ends up in a browser
bundle with nothing failing and nothing saying so.

## Origin

**Measured, in the built chunks.** A cache tier imports a domain's barrel for
one query function; the barrel re-exports that domain's fixture routes; and the
fixture module called its own seed function at the bottom of the file. The seed
rows shipped to every visitor.

The build succeeded. Every test passed. The only symptom was a larger chunk.

## Why it happens

A bundler drops an unused export only when removing it cannot change behaviour.
A call at module scope is behaviour, so the module is kept — and with it every
constant, every table and every helper it holds, whether or not anything imports
them.

Three imports separate the mistake from the effect: *the screen imports the
cache*, *the cache imports the barrel*, *the barrel re-exports the fixture*.
Nobody reviewing any one of those files can see it.

## What to do instead

**Initialise on first use.** A `let seeded = false` and a guard at the top of the
one function that needs it. The module then holds only declarations, and a
bundler can drop the lot.

**Check the built output, not the import graph.** Reasoning about tree-shaking
is how this survives review. Pick a string that exists only in the module that
should not be there and grep the chunks for it.

## Make the check a test

It is worth automating precisely because the failure is silent and the cause is
three files away:

    grep the built client chunks for strings only a server module contains
    assert those strings ARE in that module — or you are checking for
      something nothing ever had
    when there is no build to look at, SAY SO and skip

That last line matters. A check that quietly passes when it could not run is
worse than no check, and this one can only run after a build.

## Gotchas

**A barrel is what turns a private module into a public one.** Re-exporting
everything from a directory is convenient and it means any consumer of any
export drags the graph.

**Registering something is the commonest form.** `register(this)`, adding to a
map, patching a global — all side effects, all retaining.

**It is not only bundle size.** Server-only code in a browser chunk may read
environment it does not have, or leak a shape somebody can inspect.

## Used in

`flover-next` and its two sibling templates — the fixture seeds, which are lazy,
and the check over the built chunks that keeps them that way.

## Related

[`a-fixture-should-behave-like-a-server`](a-fixture-should-behave-like-a-server.md),
[`negative-controls-catch-the-harness`](negative-controls-catch-the-harness.md).
