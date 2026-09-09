# Result — 0001 · the failure model

## Grant and barrier

    writer      spec-test-writer
    tools       Write, and nothing else
    tier        ENFORCED — no Read, no Bash, no search. The violation was
                impossible, not merely forbidden.
    audit       the transcript shows exactly ONE tool call: a single Write to
                its own output path. No other path touched.

## Oracle

    01-contract.md      244 lines, hand-authored, sha256 c367098c…
    02-api-surface.txt  65 lines of signatures — GENERATED AND THEN NOT PASSED.
                        See "What went wrong" below.

    leak surface        0 code fences · 0 previous-measurement leaks.
                        Three grep hits, all false positives: a `=>` inside a
                        type signature, and "unmeasured" as a Presence state.

    tier                3, and weaker than that: same author, same day, derived
                        from the implementation. Recorded before the run.

    disqualified        decisions/0002-…md (9 previous-measurement leaks) and
                        lib/http/doc.ts (4). Both narrate the very defects this
                        run scores with. Using either would have handed the
                        writer its answers.

## Compile and run

    as written          1188 lines, 111 `it` blocks, 2 compile errors
    fixes               2, both mechanical, neither touching an expectation:
                        · a type argument, where `err()` defaults its value type
                          to `never` and `unwrapOr(0)` therefore will not
                          typecheck
                        · one call reshaped, where the port takes a body inside
                          its options object
    first run           146 tests · 142 passed · 4 failed

## Triage — all four failures were SPEC gaps, none was a defect

Order followed: oracle, then test, then implementation.

| test | verdict | the gap |
| --- | --- | --- |
| request id from the body | **spec is wrong** | the contract says "taken from the body" and never names the wire key. The code reads `request_id`; the writer sent `requestId`. The contract names the HEADER spellings exactly and not the body ones. |
| retryAfter from the body | **spec is wrong** | identical: the code reads `retry_after`. |
| exceeding a time budget | **spec is wrong** | the contract never says the budget is configurable, nor what its default is (15s). With no `timeoutMs` the test outlived the runner's own 5s limit. The ASSERTION is right; only the setup was unreachable from the contract. |
| `requireToken` | **spec is wrong** | named in the tooling note, never specified. It returns a `Result`, not a bare token. The writer flagged it as unspecified and guessed. |

**Zero implementation bugs found.** Every failure was a hole in the oracle.

The four are `it.skip` with a TRIAGED comment naming the gap. **They were not
fixed and the contract was not amended.** A runner may not supply the next
oracle: an amendment written by someone who has read the implementation, and
then measured against a barriered writer, closes the loop this procedure exists
to open. The sentences to add are recommended below, for the author.

## Mutation score — the scoring step

    controls    must-die = killed · must-survive = SURVIVED  → the harness measures

    snapshot suite (written alongside the code)     6/10 killed · 4 survived
    barriered suite (written from the contract)     9/10 killed · 1 survived
    both together                                  10/10 killed · 0 survived

| mutant | snapshot | spec |
| --- | --- | --- |
| M1 a time budget elapsing classified as a cancellation | killed | **SURVIVED** |
| M2 an unrecognised `not_found` reported as emptiness | killed | killed |
| M3 `narrow` folds a transport failure | killed | killed |
| M4 a member dropped from the retryable set | killed | killed |
| M5 the backoff cap moved 8s → 80s | **survived** | killed |
| M6 `retryAfter` read as ms rather than seconds | killed | killed |
| M7 an unserved fixture route answers `not_found` | **survived** | killed |
| M8 `isFailure` stops requiring a string message | **survived** | killed |
| M9 412 decodes as `invalid` rather than `conflict` | **survived** | killed |
| M10 a non-JSON 2xx body reported as a transport fault | killed | killed |

**The prediction, recorded before the run, was right on all three named faults.**
M1 was called at 50/50 and survived; M2 and M3 were called as kills and were.

M1's survivor is a finding about the **contract**, not the suite: the assertion
the writer produced is correct and would have killed the mutant with a shorter
budget. It could not know one was settable.

The four the snapshot suite missed are the method paying for itself. Each is a
boundary the implementation's own author had no reason to doubt — the exact cap
value, a status folding, a structural guard's second condition, and a fixture's
failure mode. A test written from a stated rule checks the rule; a test written
beside the code checks what the author was already thinking about.

## What went wrong in the running of it

**`02-api-surface.txt` was generated and then never passed to the writer.** The
signatures were extracted, hashed and filed, and the prompt went out without
them. The writer named that gap as its single largest risk before it saw a
result, and it produced one compile error and, indirectly, the `requireToken`
failure. Recorded because a custody record that accumulates only clean runs is a
marketing document.

## Recommended contract amendments — for the author, not this runner

> **Acted on 2026-09-09 — see [`06-amendments.md`](06-amendments.md).** Two were
> wording; two turned out to be defects in the implementation. `01-contract.md`
> is unchanged, and its hash still covers what the writer was given.


1. §12 should name the body keys as it already names the header keys:
   `request_id`, `retry_after`.
2. §12 should state that a request carries a time budget, that it is settable
   per client and per request, and what the default is.
3. `requireToken` should be specified or removed from the writer's brief.
4. §9 should say what `err()` does with its value type, or `unwrapOr` should be
   callable without a type argument.

## Custody

`protocols/custody.md` says to decline custody for a solo project where nobody
is being asked to trust anything. This entry exists anyway, because it is the
first exercise of the method here and the thing worth keeping is whether the
method works at all. It is NOT hash-chained and no manifest is maintained; the
subject hashes below are the whole of the claim.

    oracle    01-contract.md            c367098ccab16d27…
              02-api-surface.txt        b2bc11f96341b705…  (filed, NOT passed)
    suite     as written                0faf20ab7772bbba…   suite/failure-model.spec.ts
              as run                    cc1a9146fcf27e04…   lib/http/failure-model.spec.test.ts
    baseline  as run                    63d17e48688d22b3…   lib/http/failure-model.test.ts

## Amendment · 2026-09-09 — the run subjects moved

The two runnable suites were relocated from `lib/` into `lib/http`, the lowest
tier permitted to import both the kernel and the transport, and their imports
were rewritten from the project alias to relative paths so they travel with the
tier they cover.

**The as-run hashes above changed, and both are restated rather than quietly
corrected** — that is the whole point of recording them. What did NOT change is
`suite/failure-model.spec.ts`, the as-written artifact the barriered writer
produced: `0faf20ab7772bbba…`, byte-identical, which is the hash the provenance
claim actually rests on.

The edits were a directory move and four import specifiers. No expectation was
touched, and the mutation result below was re-run afterwards and is unchanged.
