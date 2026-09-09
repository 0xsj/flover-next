import { NextResponse, type NextRequest } from "next/server";
import { SEARCH_HEADER } from "@/app/_lib/request";

/* Renamed from `middleware.ts` in Next 16; the old name is deprecated.
 *
 * # It exists for one line, and the line is not optional
 *
 * The chaos module forces failure, emptiness and latency by wrapping the
 * transport at the composition root — and the root is built in a layout, where
 * the request's URL is not available. Next hands server code `cookies()` and
 * `headers()` and not the URL, and names headers as the way a proxy passes
 * information to the application. So the query string is copied into one.
 *
 * Without this, `?chaos=` works on exactly one hand-written screen and cannot
 * reach any of the real ones — which is a fault-injector that cannot inject a
 * fault anywhere somebody would want to see one.
 *
 * # Development only
 *
 * The header is not set in a production build, so the plan is undefined there
 * and the wrapper is absent. That is belt and braces: `withChaos` already
 * returns the client untouched in production, structurally. */
export function proxy(request: NextRequest) {
  if (process.env.NODE_ENV === "production") return NextResponse.next();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(SEARCH_HEADER, request.nextUrl.search);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  /* Everything except the framework's own assets. A chaos plan on a static
     chunk request would do nothing, and matching them costs a proxy invocation
     per asset. */
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
