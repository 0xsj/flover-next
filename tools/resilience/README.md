# Resilience checks

`npm run test:resilience` runs the response-boundary and sequence guarantees.
`npm run test:resilience:mutations` deliberately breaks seventeen of those guarantees
and checks whether the tests detect each change.

The mutation command copies source into a temporary workspace, shares the
installed dependencies, and leaves your working tree untouched. It typechecks
before each test run, reads Vitest's structured results, and restores the one
mutated file in a `finally` block. The temporary evidence directory contains
source/test hashes, compiler logs, test reports, and `report.json`.

A passing baseline, an equivalent comment-only mutation, and an intentional
compile error are controls. A compile error is **invalid**, never a killed
mutant. Missing tools, runtime import failures, and absent test reports stop the
harness instead of producing a score. A surviving or invalid scored mutation
also makes the command fail; inspect the evidence before changing anything.

The changes cover bypassed decoding, partial array validation, obsolete
responses, discarded previous data, loss before rather than after a commit,
overlapping unresolved saves, overwritten drafts, and failed reconciliation
misreported as absence, sending without a checkpoint, accepting stale item
revisions, and forgetting committed receipts. The draft mutations now target
the shared state machine used by the note, item and session recipes. Six further
mutations exercise wrong-account recovery, forbidden-as-expiry, old grants during
refresh, observation accidentally canceling work, cancellation acknowledgment
inventing completion, and ignoring the chosen time zone. This is a
curated regression set, not an exhaustive
mutation engine or a percentage of all possible bugs.

The contracts were written before this implementation:

- `lib/http/response.doc.ts`
- `lib/chaos/sequence.doc.ts`
- `app/(workspace)/cookbook/(recipes)/resilience/doc.ts`
- `lib/runtime/save-draft.doc.ts`
- `lib/services/example/item-workflow.doc.ts`
- `app/(workspace)/cookbook/(recipes)/items/doc.ts`
- `lib/runtime/session-recovery.doc.ts`
- `lib/services/access/doc.ts`
- `lib/services/jobs/doc.ts`
- `lib/locale/doc.ts`

The tests were written with implementation visibility. The full blind spec-test
procedure is **not claimed**: this session did not have a writer with an enforced
tool barrier. Mutation results establish sensitivity to the selected defects;
they establish neither oracle independence nor specification completeness.

The cookbook's save policy requires a backend that deduplicates operation IDs
and returns an authoritative final status. An absent receipt in an eventually
consistent index does not prove the operation cannot still commit. The isolated
fixture has no background writes and can make that promise; a real adapter must
preserve unknown outcomes when its server cannot.
