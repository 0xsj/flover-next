A structural check can finish successfully while the architectural review remains open.

# Architecture check

## Origin

Built from the request to check Flover's reuse, error handling, and composition
philosophy. Source review showed that the existing bundle test would warn that
it had no build to inspect and return normally. That branch counted as a pass despite
its comment promising a skip. A fixture now runs the actual test without a build
and asserts the skipped outcome.

## Why

A single green architecture verdict would repeat that failure at a larger scale.
Import ownership can be checked against an explicit policy. Whether two screens
repeat the same decision requires their contracts and reasons to change. The
runner therefore emits structural results and leaves semantic review pending,
even when its heuristics find nothing.

The installed TypeScript compiler supplies parsing, resolution, and inferred
return types without another dependency. This catches aliases and nested Result
returns that a spelling-based search misses. Changed helpers also bring their
importers into scope through re-exports: an unchanged server function can acquire
an invalid return type when its helper changes.

## Gotchas

The rulebook is an explicit set of author preferences, not a general definition
of good software. Its detector limits and exceptions belong in the evidence.
Negative controls check whether those detectors can catch known violations;
they do not independently establish whether the preferences are correct.

Git selects paths, but the content inspected is the working copy. Staged-only
versions and stale build artifacts cannot establish what a future commit ships.

## Used in

[`tools/architecture`](../../tools/architecture/README.md),
[`lib/kernel/bundle.test.ts`](../../lib/kernel/bundle.test.ts).
