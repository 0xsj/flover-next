import { assertNever, isTransport, type Failure, type TransportFailure } from "@/lib/kernel";

/* The transport surface, written ONCE.
 *
 * Every screen can receive a transport failure — any call can produce one, and
 * after the split no service may claim otherwise. So these seven cases live
 * here, and a screen switches only over the domain kinds its service promised. */

export function TransportProblem({ failure }: { failure: TransportFailure }) {
  switch (failure.kind) {
    case "unauthenticated":
      return <Notice tone="warn">{failure.message} <a href="/sign-in">Sign in</a></Notice>;

    case "forbidden":
      // Deliberately NOT a sign-in prompt: they are signed in, and offering it
      // sends them round a loop that cannot end.
      return <Notice tone="crit">{failure.message}</Notice>;

    case "rate_limited":
      // `retryAfter` exists only on this branch, and it still arrives — v2's
      // narrowing folded this kind into `internal` and threw the number away.
      return (
        <Notice tone="warn">
          Too many requests.{failure.retryAfter ? ` Try again in ${failure.retryAfter}s.` : ""}
        </Notice>
      );

    case "unavailable":
    case "timeout":
      return <Notice tone="warn">{failure.message} This is usually temporary.</Notice>;

    case "canceled":
      // An answer, not a failure. They asked for this.
      return null;

    case "internal":
      return (
        <Notice tone="crit">
          Something went wrong.{failure.requestId ? <code> {failure.requestId}</code> : null}
        </Notice>
      );

    default:
      return assertNever(failure, "transport failure");
  }
}

/** For the one place that holds an unnarrowed `Failure` — an error boundary, or
 *  a failure recovered from a `catch`. Ten cases, and an eleventh kind stops
 *  this file compiling. */
export function Problem({ failure }: { failure: Failure }) {
  if (isTransport(failure)) return <TransportProblem failure={failure} />;
  switch (failure.kind) {
    case "not_found": return <Notice tone="quiet">Not found.</Notice>;
    case "invalid":   return <FieldErrors fields={failure.fields} />;
    case "conflict":  return <Notice tone="warn">{failure.message} Reload to see the current version.</Notice>;
    default:          return assertNever(failure, "domain failure");
  }
}

export function Notice({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <p data-tone={tone}>{children}</p>;
}

export function FieldErrors({ fields }: { fields: Record<string, string> }) {
  return <ul>{Object.entries(fields).map(([k, v]) => <li key={k}>{k}: {v}</li>)}</ul>;
}
