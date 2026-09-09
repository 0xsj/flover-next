import { cookies } from "next/headers";

/* The whole framework-specific half of authentication, in one file.
 *
 * `lib/root` is handed its token rather than reading one, and its doc says why:
 * reading a cookie is the caller's job, and the caller is the one place that
 * differs between this template and its Solid and Svelte siblings. This is that
 * place. A product swapping to a bearer header, a third-party provider or a
 * database session replaces this file and nothing above it.
 *
 * # HttpOnly, so the token is not reachable from script
 *
 * The cookie cannot be read by the page, which means an injected script cannot
 * lift the session — and it means the client never sees the token at all. Every
 * authenticated call is therefore made on the server, which is the arrangement
 * the rest of this app already assumes.
 *
 * # Writing one is only legal in a Server Function or Route Handler
 *
 * HTTP does not allow a `Set-Cookie` after the response has begun streaming, so
 * a server component cannot start a session — it can only read one. That is why
 * signing in is an action rather than a page. */

export const SESSION_COOKIE = "flover_session";

const WEEK_IN_SECONDS = 60 * 60 * 24 * 7;

/** Readable anywhere on the server. Null means signed out, and it is a value,
 *  not a failure — nobody asked yet. */
export async function readSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

/** Server Functions and Route Handlers only. */
export async function startSession(token: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // Off in development, because localhost is not https and a secure cookie
    // there is silently never sent — which reads as "sign-in does nothing".
    secure: process.env.NODE_ENV === "production",
    maxAge: WEEK_IN_SECONDS,
  });
}

/** Server Functions and Route Handlers only.
 *
 *  Forgetting the token here is the half that actually signs somebody out of
 *  this browser. Ending it on the server is the service's job and the two are
 *  separate calls, because either can fail without the other. */
export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
