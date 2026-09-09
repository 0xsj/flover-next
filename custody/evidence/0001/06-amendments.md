# Amendments to the contract — 2026-09-09

Written by the AUTHOR, on a separate pass, which is the only way this is
allowed to happen. `05-result.md` recorded four gaps and explicitly did not fix
them: a runner has read the implementation, and an amendment it writes and then
measures a barriered writer against closes the loop the whole procedure exists
to open.

**`01-contract.md` is NOT edited.** Its hash `c367098ccab16d27…` is what the
provenance claim rests on — it is what the writer was actually given. These are
additive, and a future run uses the contract plus this file.

---

## 1 · §12 · the body's wire keys

**Was:** "A request id is taken from the body, or failing that from an
`x-request-id` response header." The header spelling was named exactly; the body
key was not named at all.

**Now:** the body is read in both conventions — `request_id` and `requestId`,
`retry_after` and `retryAfter`, `correlation_id` and `correlationId`. The header
falls back after both.

**And the implementation changed, not only the words.** The writer sent
camelCase, which was a reasonable reading of a contract that named no case. Both
spellings are equally common in problem documents and neither is wrong, and this
decoder is the anti-corruption layer — being liberal in what it accepts is its
job. **Two tests were un-skipped and now pass unedited.**

## 2 · §12 · the time budget

**Was:** "a request that exceeded its own time budget produces `timeout`", with
no statement that a budget is settable or what it defaults to.

**Now:** every request carries one; it is settable per client and per request,
and it defaults to 15 seconds.

The corresponding test **stays skipped**. Its assertion is correct and it cannot
pass as written — with no budget supplied it outlives the runner's own 5s
limit. A future barriered run against the amended contract would produce a
passing version; hand-editing this one against the implementation is exactly
what the barrier exists to prevent.

## 3 · §12 · `requireToken`

**Was:** named in the writer's tooling note and never specified — my error, and
the writer flagged it as unspecified before guessing.

**Now:** specified as returning a `Result`: the token on success, an
`unauthenticated` failure when the request carries none.

Its test **stays skipped** for the same reason as above: it asserts a bare token.

## 4 · §9 · `unwrapOr` and the value type of `err()`

**Was:** "`unwrapOr(x)` — the value, or x", with nothing said about the value
type of an `Err` built by `err()`.

**Now, and this one was a real defect rather than a wording gap:** `err()`
defaults its value type to `never`, so `unwrapOr` fixed to that type refused
`err(f).unwrapOr(0)` without an explicit type argument — a caller writing the
obvious thing and being told no. `unwrapOr` is now generic in the FALLBACK and
returns `T | U`.

That was one of the two mechanical fixes applied at step 4 to make the suite
compile. **It is now reverted: the writer's original line stands unmodified and
passes.**

---

## Effect on the run

    before   142 passed · 4 skipped
    after    144 passed · 2 skipped

Two gaps were wording and are fixed in the words. Two were defects in the
implementation, found by a writer that had only the contract — the strict wire
key and the un-callable `unwrapOr`. That is the method paying for itself in the
direction that matters: it disagreed with the code, and the code was wrong.

The two still skipped are honest: their assertions are right, and producing
passing versions is a barriered run's job, not an edit.

---

# Amendment · 2026-09-09 — the fixture began minting a request id

**Not a spec defect and not a test defect. The subject changed underneath a
correct assertion**, and this is the record of that rather than of a fix.

## What changed in the subject

`createMemoryClient` now mints a `requestId` per attempt and stamps it onto any
failure that does not carry one, exactly as the network adapter attaches the one
the server sent. It also matches the route before it waits, so a route may
declare its own latency, and it sleeps against the caller's `AbortSignal` so a
cancellation resolves when it is asked for rather than when the request would
have finished anyway.

The motivation was the fixture feeling unlike a server: it answered in a
constant 40ms, carried no per-attempt metadata, and so left `requestId`
undefined everywhere. `decisions/0003` draws a distinction between a correlation
id, which names an interaction, and a request id, which names one attempt and
differs on a retry. A fixture that mints neither makes that distinction
invisible until production.

## Which assertion moved, and why the assertion was not wrong

`lib/http/failure-model.test.ts` — the BASELINE suite, not the barriered one:

    it("a refusal from the fixture has the shape the wire would produce")
      expect(r.error).toEqual({ kind, message, status })

The title is the argument against the expectation. A wire refusal carries a
request id; the fixture previously did not, so the fixture was the half failing
to reproduce the wire. The assertion now pins the id's shape and compares the
rest:

    const { requestId, ...rest } = r.error;
    expect(requestId).toMatch(/^req_/);
    expect(rest).toEqual({ kind, message, status });

**Nothing in the barriered suite changed.** `suite/failure-model.spec.ts` is
still `0faf20ab7772bbba…`, byte-identical, and
`lib/http/failure-model.spec.test.ts` still passes untouched — it asserted the
kind and the metadata it was told about, and never that the metadata was
complete. Which is the more interesting result of the two: the suite written
from the contract survived a change to the subject that the suite written
against the implementation did not.

## Restated hashes

    suite     as written   0faf20ab7772bbba…   unchanged
              as run       cc1a9146fcf27e04…   unchanged
    baseline  as run       63d17e48688d22b3…   SUPERSEDED
                           c1e575fee0916652…   lib/http/failure-model.test.ts
