/**
 * query — the async cache, and the only place a value becomes a throw.
 *
 * # Not portable, and that is correct
 *
 * This is the one tier below the screens that binds to a framework: the sibling
 * templates use the Solid and Svelte adapters of the same library. The SHAPE
 * ports — one throw site, keys in one file, the retry policy asking the kernel —
 * and the files do not. It is therefore excluded from the copy-verbatim set.
 *
 * # The retry policy asks the kernel, and never a status code
 *
 * `retryDelay` returns a delay or null. Null for anything that is an ANSWER
 * rather than a fault — a refusal, a validation failure, a cancellation. A
 * delay the server itself chose, when it sent a retry-after.
 *
 * The project this was extracted from states that rule in a comment and then
 * compares `error.status` to 400 and 500 in the function below it. One
 * definition, in the kernel, consulted here.
 *
 * # Why `queryOptions` rather than a bare key and function
 *
 * It keeps the two together, so a caller cannot pair the wrong key with the
 * wrong fetcher — which is the failure that presents as a screen refusing to
 * update after a mutation, and reads as a stale server rather than a typo.
 *
 * # `unwrap` is the boundary, and it is deliberately ugly
 *
 * Everything below returns a Result. The cache wants a rejected promise. So one
 * function converts, here, and every tier below stays free of invisible control
 * flow. `asFailure` on the way back turns the thrown thing into the same value
 * the rest of the system speaks, so one exhaustive switch serves both paths.
 *
 * # What is deliberately absent
 *
 * **Mutations.** They need a caller to be worth shaping, and the shape depends
 * on what a form does with a failure — see the decision record on the failure
 * model. Add them with the first write screen.
 *
 * **Prefetching and hydration.** A real concern in this framework and a
 * premature one here; both are additive and neither changes anything above.
 */
export {};
