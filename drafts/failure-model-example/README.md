# draft — errors as values, v3

**Status: draft.** Same three claims as [v1](../errors/README.md), same six
changes as [v2](../errors-v2/README.md), one structural correction that makes
v2's changes stop fighting each other — plus a composition root, refusing
fixtures and a wired async cache, so the examples are a feature rather than a
sketch. **44 tests.**

```
kernel/
  failure.ts     the union, split into TRANSPORT and DOMAIN kinds · narrow() · cause chain · retryDelay
  result.ts      Result as a class; ok() returns Ok, err() returns Err
  optional.ts    three states, with absence named by the caller · Presence
  app-error.ts   the ONE class that is thrown
http/
  port.ts        HttpClient, returning Result · FailureDecoder, pluggable
  envelope.ts    the default decoder — the only file naming a status or a wire key
  fetch-client.ts · memory-client.ts
root/
  index.ts       the composition root — the ONLY file that picks an adapter
  fixtures.ts    routes that REFUSE: 401, 409, 422, 429, and a typed 404 for absence
query/
  client.ts      the cache's defaults — retry asks the kernel, never a status
  queries.ts     the one throw site, four lines
  keys.ts        every cache key in one file
  provider.tsx
services/targets.ts
usage/
  problem.tsx              the transport surface, written ONCE
  1-server-screens.tsx     RSC list · detail · three states
  2-client-query.tsx       useQuery — same problem components as the server
  3-client-mutation.tsx    useMutation — field errors, conflict, invalidation
  4-server-action-form.tsx useActionState against the action
  5-server-action.tsx      what crosses the boundary instead of a Result
  6-failure-as-props.tsx   a Failure as a client prop
```


---

## The correction: kinds are not all the same kind of thing

v2 let a service narrow the union to what an operation "can produce", and its
example folded `rate_limited` and `canceled` into `internal`. Measured against
v2: a rate-limited read gave `retryDelay` of null, discarding the retry-after
that v2's own change six had just added support for; and a user's cancellation
rendered as "something went wrong".

The mistake was treating all ten kinds as per-operation. Seven of them are not:

```
TRANSPORT   unauthenticated forbidden rate_limited unavailable timeout canceled internal
            — any call can produce one. No service gets to say otherwise.
DOMAIN      not_found invalid conflict
            — varies by operation. This is the ONLY set a service narrows.
```

So a signature is `TransportFailure` plus the domain kinds this operation
promises, and narrowing is one line:

```ts
export type ReadFailure = TransportFailure | Fails<"not_found">;
const asReadFailure = narrow("not_found");
```

`narrow` passes every transport kind through untouched and folds an unpromised
domain kind into `internal` with the original as `cause`. v2's fifteen-line
switch per tier is gone, and so is the defect it carried. Retry survives.
Cancellation survives. The signature is still enforced: `case "invalid"` on a
`ReadFailure` is a compile error.

### What it buys on screen

Every screen can receive a transport failure, so the transport surface is
written **once** and a screen switches only over its domain kinds:

```tsx
err: (f) => {
  if (isTransport(f)) return <TransportProblem failure={f} />;
  switch (f.kind) {
    case "not_found": return <p>That target does not exist.</p>;
    default:          return assertNever(f, "read failure");
  }
}
```

One case for a read, three for a create, ten for the unnarrowed boundary. The
compiler holds all three.

---

## Three more defects, fixed while here

**`optional` absorbed every 404.** Measured against v2: with no fixture route
registered, `findPrimaryTarget` rendered "no primary target has been chosen".
Whether a 404 means *absent* or *wrong path* is a property of the backend, so
the service now says which, and the argument is required:

```ts
optional(read, absentWhenType("no_primary_target"))   // the usual choice
optional(read, anyNotFound)                            // the weak one, named so it greps
```

A `not_found` the predicate does not recognise is **not** passed through under
a type that promised it could not occur. It folds to `internal` with cause,
and the screen says *nobody looked* rather than *nothing here*. Type-level, the
return is `Result<T | null, Exclude<E, not_found> | internal>`, which for a read
collapses to `TransportFailure`.

**The memory adapter answered an unserved route with `not_found`.** v1's reason
was that a real server 404s too. True of the server; but the fixture not
answering is a fixture bug, not a server behaviour being reproduced, and
labelling it 404 is what let `optional` lie. It is now `internal` with
`type: "unserved_route"`. A screen that wants a 404 registers a route that
returns one, which is the discipline anyway.

**A timeout was a cancellation.** v1's fetch client aborted a controller by
hand on timeout, which raises `AbortError`, so every timeout was classified
`canceled` and never retried. `AbortSignal.timeout` raises `TimeoutError`.
Tested with a stubbed fetch and a 5ms budget. Related: transport errors are now
matched by `name`, not `instanceof DOMException`, because under jsdom the global
is jsdom's and fetch throws Node's.

---

## Backend-agnostic, structurally

`ClientConfig.decodeFailure` replaces the envelope for a backend that speaks
differently. The envelope stays the default and stays the only file that names
a wire key — CLAUDE.md's rule is intact — but a product no longer edits the
template's http tier to honour it. The default now also reads `detail`/`title`
as message fallbacks, so an RFC 9457 body works without a custom decoder, and
`retry-after` from the header when the body has none.

---

## What it looks like in a component

### The transport surface is written once

Any call can produce a transport failure, so those seven cases live in
`usage/problem.tsx` and a screen switches only over what its service promised:

```tsx
err: (f) => {
  if (isTransport(f)) return <TransportProblem failure={f} />;
  switch (f.kind) {
    case "not_found": return <Notice tone="quiet">That target does not exist.</Notice>;
    default:          return assertNever(f, "read failure");
  }
}
```

One case for a read. Three for a create. Ten at the unnarrowed boundary. The
compiler holds all three, and `case "invalid"` on a read does not compile.

### The cache asks the kernel for its retry rule

```ts
retry:      (attempt, error) => attempt < 2 && retryDelay(asFailure(error), attempt) !== null,
retryDelay: (attempt, error) => retryDelay(asFailure(error), attempt) ?? 0,
```

Nothing here names a status code. **Tested**: a 429 from the fixtures waits
12 000 ms because the server said `retry-after: 12`; a `forbidden`, a
`not_found`, an `invalid` and a `canceled` are never retried, because each is an
answer rather than a fault. That number surviving the service tier is the whole
point of the transport/domain split — v2 folded `rate_limited` into `internal`
and threw it away.

### The client screen uses the SAME problem components as the server

```tsx
const { data, error, isPending } = useQuery(targetsQuery(client, workspace));

if (isPending)          return <p aria-busy="true">Loading…</p>;
if (error)              return <Problem failure={asFailure(error)} />;
if (data.length === 0)  return <Notice tone="quiet">No targets yet.</Notice>;
```

The cache rejects with an `AppError`; `asFailure` turns it back into the value
the rest of the system speaks. One vocabulary, both paths.

Three states survive the cache too, because `null` is a legitimate value rather
than an error — rebuilt from the cache's two channels with the same constructors
the service tier uses, no cast:

```tsx
const presence = presenceOf(error ? err<Target | null>(asFailure(error)) : ok<Target | null>(data));
```

### A write has exactly three branches

`createTarget` promises `invalid | conflict` on top of transport, so the form
has three cases and the compiler knows it:

```tsx
onError:   (error) => setFailure(asFailure(error)),
onSuccess: () => cache.invalidateQueries({ queryKey: keys.targets.all(workspace) }),
```

```tsx
if (isTransport(failure)) return <TransportProblem failure={failure} />;
switch (failure.kind) {
  case "invalid":  return <FieldErrors fields={failure.fields} />;   // fields only exist here
  case "conflict": return <p role="alert">{failure.message} Reload to see the current list.</p>;
}
```

and per-input wiring falls out of the same value:

```tsx
<input name="host" aria-invalid={fieldOf(failure, "host") ? true : undefined} />
```

### The same form as a Server Action, because the failure takes a different route

A throw would replace the form with an error page and lose what was typed. The
action returns the value instead — and it crosses the boundary because a
`Failure` is plain data. **What does not cross is the `Result`**: it is a class,
its methods do not survive, so the action unwraps it into an explicit form state
first.

### The fixtures refuse

`root/fixtures.ts` has five refusals against four successes — 401 without a
bearer, 409 on a duplicate name, 422 on an internal host, 429 with a
`retry-after`, and a typed 404 that means *absence* rather than *wrong path*.

The 422 case is the one worth reading: it passes every client-side rule and the
server still refuses it. A form built against a fixture that always accepts is a
form nobody has tested.

---

## Kept from v2, unchanged in intent

Exact-variant constructors and `Fails<K>`. The cause chain. `Result` as a class
with `Failure` as plain data, and the rule that a `Result` never crosses the
RSC boundary — `3-server-action.tsx` shows what crosses instead. Retry as a
delay. One small reversal: `ok()` returns `Ok<T, E>` and `err()` returns
`Err<T, E>`, because v2 widened them and `ok(1).value` stopped typechecking,
which was the precision loss v2 had just criticised in v1's constructors.

---

## What v3 costs

- **A decision per optional read.** `absent` is required. That is the point,
  and it is still work.
- **The split is a kernel opinion.** If a product decides `not_found` is
  transport-like for its API, the constant arrays move; nothing else does.
- **Two representations to keep straight**, as in v2: `Result` has methods,
  `Failure` does not.

## Open before this leaves `drafts/`

1. `status` on `FailureMeta` is still not detectable above `lib/http`. Same as v1.
2. `retryDelay` does not walk the cause chain. After the split it does not
   need to, since a transport kind is never folded — but a product that adds
   its own folding should know.
3. `lib/root` is untouched. Picking an adapter per domain is the next piece.
