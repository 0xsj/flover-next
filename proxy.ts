import { NextResponse, type NextRequest } from "next/server";
import { PATH_HEADER, SEARCH_HEADER } from "@/app/_lib/request";

/* Request metadata belongs at the framework boundary. The path is always
 * overwritten so guards can preserve a recipe destination, including its query.
 * Chaos metadata is forwarded only in development and removed in production. */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(PATH_HEADER, `${request.nextUrl.pathname}${request.nextUrl.search}`);
  if (process.env.NODE_ENV === "production") requestHeaders.delete(SEARCH_HEADER);
  else requestHeaders.set(SEARCH_HEADER, request.nextUrl.search);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  /* Everything except the framework's own assets. A chaos plan on a static
     chunk request would do nothing, and matching them costs a proxy invocation
     per asset. */
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
