import { listSessions } from "@/lib/services/session";
import { serverRoot } from "@/app/_lib/root";
import { respond } from "@/app/_lib/respond";

/* The browser's door, and it exists because the session cookie is HttpOnly.
 *
 * The page cannot read the token, which is the point — an injected script
 * cannot lift it. So a browser-side read cannot call the API directly; it calls
 * this, on the same origin, and the cookie rides along automatically.
 *
 * # It speaks the same contract the fetch adapter decodes
 *
 * `respond` writes the flat problem document `lib/http/envelope.ts` expects, so
 * the browser's client decodes it into the identical `Failure` the server just
 * had. Nothing above the transport can tell which side produced it, which is
 * what makes this a server rather than an exception to the architecture.
 *
 * # The path mirrors the API's own
 *
 * `/api/auth/sessions` for the service's `/auth/sessions`, so the browser's
 * client is the same fetch adapter with `/api` as its base and the SERVICE is
 * unchanged — it does not know, and must not know, which side is calling it. */
export async function GET(): Promise<Response> {
  const root = await serverRoot();
  return respond(await listSessions(root.clientFor("session")), root.correlationId);
}
