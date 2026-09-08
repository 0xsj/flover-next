import { QueryClient } from "@tanstack/react-query";
import { asFailure, retryDelay } from "@/lib/kernel";

/* One client per browser tab, and the defaults are the whole of the policy.
 *
 * The point of this file: the cache does not invent a retry rule. It asks the
 * kernel, which answers with a DELAY or null — so a 429's `retry-after` is
 * honoured, a 403 is never retried because it is an answer, and a user's own
 * cancellation is never retried because they asked for it.
 *
 * Nothing here names a status code. That rule was stated in a comment in the
 * project this was extracted from, and broken by the line under it. */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,

        /** One question, asked of one definition. `retryDelay` returns null for
         *  anything that is an ANSWER rather than a fault. */
        retry: (attempt, error) => attempt < 2 && retryDelay(asFailure(error), attempt) !== null,

        /** And the wait is whatever the kernel computed — the server's own
         *  retry-after when it sent one, exponential backoff otherwise. */
        retryDelay: (attempt, error) => retryDelay(asFailure(error), attempt) ?? 0,

        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        // A write is never retried automatically: the second attempt may
        // succeed against state the first one already changed.
        retry: false,
      },
    },
  });
}
