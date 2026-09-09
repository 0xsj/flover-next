# 0005 — a write is a server action or a mutation, and what it touches decides which

**Status:** Accepted   ·   **Date:** 2026-09-09

## Context

Two write paths now exist in this template and they are not interchangeable.

Signing in, signing up and signing out are **server actions**. That was not a
preference: the session is an HttpOnly cookie, and HTTP does not permit a
`Set-Cookie` once a response has begun streaming, so a submit that starts a
session has to terminate in a Server Function or a Route Handler. `<form
action={…}>` with `useActionState` then supplies the pending flag and the
returned state, and the form submits before JavaScript has loaded — which
matters more on a sign-in page than anywhere else in an application.

Revoking another session is a **mutation over the transport port**, through
`lib/query`. Also not a preference: it is a row in an already-loaded,
already-interactive list, the right answer is to remove the row immediately, and
the thing that has to be corrected on refusal is a cache the server does not
own.

The problem is that neither reason is visible from a call site. `lib/query`'s
own doc said mutations were "deliberately absent — add them with the first write
screen"; two write screens then arrived and both went to server actions, because
the session forced it and nobody wrote down that the forcing was specific. A
product's first non-auth write meets an undocumented fork, and the answer it
picks is whichever example it read last.

## Decision

**What the write touches decides the mechanism, and there are two answers.**

**A server action, when the write touches the session or must work without
JavaScript.**

- It can set and clear cookies; a mutation cannot.
- It renders on the server, so the form works before hydration.
- It returns **plain data** — never a `Result`, which is a class and does not
  survive serialisation. `app/_lib/form-state.ts` is the one shape it becomes,
  and `lib/kernel/boundaries.test.ts` fails the build otherwise.
- It calls a service with `root.client` like everything else. **The port is not
  bypassed**; it sits behind an RPC rather than in front of one, so swapping the
  adapter still changes every write with it.

**A mutation over the port, when the write changes a resource a cache is already
holding, from a screen that is already interactive.**

- It is the only mechanism that can update optimistically, because the thing
  being updated is the cache.
- It invalidates by key, so one line refreshes every read of that domain.
- It cancels in-flight reads first. A refetch already on its way resolves with a
  list that still contains the removed row and lands *after* the optimistic
  update, so the row reappears for a frame. `cancelQueries` is what makes the
  optimism hold, and it is the reason the port has always accepted a signal.

**The rollback is decided by the failure KIND, not by the fact of failure.** A
`not_found` on a delete means the row had already gone, so the optimistic
removal was correct and putting it back is worse than doing nothing: it shows a
dead row and tells the reader their action failed after it had succeeded. Every
other kind rolls back.

**Read and write failures get separate surfaces.** Collapsing them tells a
reader the list is unavailable while they are looking at it.

## Alternatives

**Server actions for everything, `revalidatePath` for invalidation.** Coherent,
fewer moving parts, and genuinely the right answer for a mostly-server-rendered
product. Rejected because it cannot update optimistically — `revalidatePath`
round-trips the server before anything changes on screen — and because it would
leave `lib/query` a tier with one caller, which this project's own rule calls a
tier that will be wrong when something finally reaches it.

**Mutations for everything, with a route handler for the cookie.** Uniform, and
it keeps every write on the port. Rejected because the sign-in form would lose
progressive enhancement and would hand-roll the pending, error and reset states
that `useActionState` already provides — three states re-implemented per form,
which is where forms rot.

**Let each screen choose.** The status quo that produced this record. Rejected
because the fork is invisible at the call site and the answer defaults to
whichever example was read most recently.

**A single wrapper that hides which is which.** Rejected: they have different
capabilities — one can set a cookie, the other can be optimistic — and a wrapper
that hides a capability difference is a wrapper that will be fought.

## Consequences

**Two mechanisms to learn, permanently.** This is the real cost. The mitigation
is that the question "does this touch the session, or must it work without JS?"
has an obvious answer at every call site, and everything else is a mutation.

**A server action's failure is converted twice.** `Result` → `FormState` on the
server, and the form reads plain data. A mutation's failure stays a `Failure`
all the way to the component, via `asFailure`. Two shapes for one union, and the
second is richer — which is a real asymmetry and the argument the rejected
"mutations for everything" alternative would have won on.

**Optimistic writes make the cache the source of truth for one frame.** If
`onSettled` stops invalidating, the screen can hold a value the server never
agreed to, indefinitely, and nothing will say so.

**`lib/query`'s doc no longer says mutations are absent.** It says when they are
the answer, and points here.

## Verification

- A `"use server"` file never returns a `Result`. *Asserted* —
  `lib/kernel/boundaries.test.ts`, with a self-test that it can see a violation.
- What an action returns survives `JSON.parse(JSON.stringify(…))`. *Asserted.*
- The optimistic removal happens before the server answers. *Asserted* —
  `lib/query/mutation.test.tsx`.
- A refusal rolls the row back; a `not_found` does not. *Asserted*, both
  directions, which is the pair that matters.
- The list is invalidated after the write settles, either way. *Asserted.*
- A domain kind the operation did not declare folds to `internal` with its cause
  preserved — on writes as well as reads. *Asserted.*
- **Not verified:** that a future non-auth write picks the right mechanism. That
  is a review property, and `protocols/spec-tests.md` is explicit that a
  discipline cannot be tested. A check could plausibly assert that no
  `"use server"` file outside the session routes exists, and none does.
- **Not verified:** that `onSettled` keeps invalidating. Removing it leaves every
  test above passing except the last one, which is why that one exists.
