import { cache } from "react";
import { redirect } from "next/navigation";
import { AppError, type Presence, type TransportFailure } from "@/lib/kernel";
import { createRoot, DOMAINS, type Domain, type Root } from "@/lib/root";
import { ledgerRoutes } from "@/lib/services/ledger";
import { currentUser, sessionRoutes, type User } from "@/lib/services/session";
import { requestChaos } from "./request";
import { readSessionToken } from "./session";

/* Where the request meets the composition root.
 *
 * # `cache` is what makes "one root per interaction" true
 *
 * `lib/root` asks for one root per INTERACTION, not per request, so that every
 * call a screen makes carries the same correlation id. A server component tree
 * is many components and one interaction — a layout and its page each calling
 * `createRoot` would produce two ids for one render, and the question the id
 * exists to answer, *what else happened when they did this*, stops having an
 * answer.
 *
 * React's `cache` scopes a value to the current render, which is exactly the
 * unit wanted. One root per server render, one per action.
 *
 * # Fixtures unless an API is configured, and PER DOMAIN
 *
 * No `API_BASE_URL` and every call is served from the route table, which is a
 * supported way to run the whole application rather than a stub. Setting it
 * switches the adapter and nothing else changes anywhere above this line.
 *
 * `API_SERVED_DOMAINS` narrows that to a list, which is how a backend
 * graduates one domain at a time: `session` goes to the network the day its
 * endpoints ship, and `ledger` keeps answering from the fixture until its own
 * do. Omitted means all of them, so the simple case needs one variable.
 *
 * # The chaos plan arrives here, not from a page
 *
 * `?chaos=` has to reach the client at the moment it is built, and it is built
 * in a layout — which renders before any page body runs. A plan read from a
 * page's `searchParams` would arrive too late to wrap anything. So `proxy.ts`
 * copies the query string into a header before either exists, and this reads it
 * once. Nothing below this line knows chaos happened. */

/** `API_SERVED_DOMAINS=session,ledger`. Unset means every domain. */
function servedDomains(): readonly Domain[] | undefined {
  const raw = process.env.API_SERVED_DOMAINS?.trim();
  if (!raw) return undefined;
  const named = new Set(raw.split(",").map((d) => d.trim()));
  return DOMAINS.filter((d) => named.has(d));
}

export const serverRoot = cache(async (): Promise<Root> =>
  createRoot({
    baseUrl: process.env.API_BASE_URL || undefined,
    served: servedDomains(),
    /* A suite is not a demo. The fixture's realistic latency is the point in a
       browser and pure cost in a test run, where it turned thirteen action
       tests into eight seconds of waiting. */
    latencyMs: process.env.NODE_ENV === "test" ? 0 : undefined,
    token: await readSessionToken(),
    /* Every domain's fixtures, composed here — which is the shape a product
       inherits: one list, assembled at the root, and a domain that graduates to
       a real endpoint drops out of it. */
    routes: [...sessionRoutes, ...ledgerRoutes],
    chaos: await requestChaos(),
  }),
);

/** Who is signed in — as THREE states, because there are three.
 *
 *  The bug this replaced: `me.ok ? user : null`. A transport failure — the
 *  server is down, the request timed out — became "nobody is signed in", which
 *  is the exact collapse `CLAUDE.md` forbids: *nobody looked* rendered as
 *  *looked and found nothing*. Branching on `ok` instead of on the KIND is how
 *  it happens, and it happened here, in the code written to demonstrate the
 *  failure model.
 *
 *      no cookie                    empty      nobody is signed in
 *      the bearer is good           found
 *      unauthenticated · forbidden  empty      the token is not good, so
 *                                              nobody is signed in — the
 *                                              server ANSWERED
 *      anything else                unmeasured we could not find out
 *
 *  The third row is the one that matters: an expired token and an unreachable
 *  server are different facts, and only one of them means sign in again. */
export const currentSession = cache(
  async (): Promise<Presence<User, TransportFailure>> => {
    if (!(await readSessionToken())) return { state: "empty" };

    const root = await serverRoot();
    const me = await currentUser(root.clientFor("session"));
    if (me.ok) return { state: "found", value: me.value };

    return me.error.kind === "unauthenticated" || me.error.kind === "forbidden"
      ? { state: "empty" }
      : { state: "unmeasured", failure: me.error };
  },
);

/** The guard for everything behind the shell.
 *
 *  It asks the server who the bearer belongs to rather than trusting that a
 *  cookie exists: a token that was revoked, expired or invented still arrives
 *  as a cookie, and a guard that only checks for presence lets all three
 *  through. The cost is one call per render, deduplicated by `cache`.
 *
 *  # Two ways not to have a user, and they end differently
 *
 *  *Nobody is signed in* is a redirect — go and sign in, it will work.
 *
 *  *We could not find out* is a THROW. Sending somebody to a sign-in form
 *  because the server is unreachable is a lie that also loses their place, and
 *  the form they arrive at would fail for the same reason. `AppError` is the
 *  kernel's one sanctioned throw, and `app/error.tsx` is what catches it —
 *  which is the whole reason a screen-level boundary exists.
 *
 *  This is the rule for a server component generally: **a failure that makes
 *  the SCREEN meaningless is thrown; a failure that makes one REGION meaningless
 *  is rendered.** A panel among several renders its own surface; a guard has no
 *  screen left to render. */
export const requireUser = cache(async (): Promise<User> => {
  const session = await currentSession();
  if (session.state === "found") return session.value;
  if (session.state === "empty") redirect("/sign-in");
  throw new AppError(session.failure);
});

/** For a surface that renders differently when signed in but does not demand
 *  it. It takes the three states rather than flattening them, so a caller can
 *  decide what an unmeasured session means for IT — usually "carry on as
 *  signed out", which is safe for a public page and would be wrong for a
 *  guard. */
export const optionalUser = cache(async (): Promise<User | null> => {
  const session = await currentSession();
  return session.state === "found" ? session.value : null;
});
