"use client";

import { isFailure, retryDelay, type Failure } from "@/lib/kernel";

/* A client component receiving a Failure produced on the server. It crossed
 * the RSC boundary as JSON because it is a plain object — no prototype, no
 * `instanceof`, no structural tag to compensate. The framework REDACTS a
 * thrown error before a client boundary sees it; passing the failure as DATA
 * is how the client learns what happened. */

export function RetryPanel({ failure, onRetry }: { failure: Failure; onRetry: () => void }) {
  const delay = retryDelay(failure, 0);
  return (
    <div>
      <p>{failure.message}</p>
      {delay !== null ? <button onClick={onRetry}>Try again{delay > 1000 ? ` in ${Math.round(delay / 1000)}s` : ""}</button> : null}
      {failure.requestId ? <code>{failure.requestId}</code> : null}
    </div>
  );
}

export function fromUnknownBoundary(value: unknown) {
  return isFailure(value) ? value.kind : "internal";
}
