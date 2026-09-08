import { internal, isFailure, type Failure } from "./failure";
import type { Result } from "./result";

/** The envelope, and the only class that is thrown. Nothing below the React
 *  edge throws; error boundaries, Server Actions and the async cache mark
 *  failure by a rejected promise, so exactly one place converts — here. */
export class AppError extends Error {
  readonly failure: Failure;
  constructor(failure: Failure) {
    super(failure.message);
    this.name = "AppError";
    this.failure = failure;
  }
}

/** The single sanctioned unwrap. */
export function unwrap<T>(r: Result<T, Failure>): T {
  if (r.ok) return r.value;
  throw new AppError(r.error);
}

/** TOTAL — always a Failure, never a rethrow. An error path that can itself
 *  fail replaces one diagnosis with a worse one. The structural branch is how a
 *  failure passed as DATA across the RSC boundary is read back. */
export function asFailure(cause: unknown): Failure {
  if (cause instanceof AppError) return cause.failure;
  if (isFailure(cause)) return cause;
  if (isFailure((cause as { failure?: unknown })?.failure)) {
    return (cause as { failure: Failure }).failure;
  }
  if (cause instanceof Error) return internal(cause.message, { type: cause.name });
  return internal("Something went wrong.");
}
