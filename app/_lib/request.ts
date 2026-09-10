import { headers } from "next/headers";
import { parsePlan, type Plan } from "@/lib/chaos";
import { safeReturnTo } from "./return-to";

/** The header `proxy.ts` copies the request's query string into.
 *
 *  Next gives server code `cookies()` and `headers()` and not the URL, and its
 *  own guidance is that a proxy passes information to the application through
 *  headers, cookies or a rewrite. So this is the sanctioned route, not a
 *  workaround for a missing one. */
export const SEARCH_HEADER = "x-flover-search";
export const PATH_HEADER = "x-flover-path";

/** Written by the proxy on every request, including production and navigation. */
export async function requestReturnTo(): Promise<string> {
  return safeReturnTo((await headers()).get(PATH_HEADER));
}

/** The chaos plan for THIS request, available to every server component.
 *
 *  It cannot come from a page's `searchParams`: the composition root is built
 *  in the layout, which renders before any page body runs, so a plan supplied
 *  by the page would arrive after the client it was meant to wrap. The header
 *  is set before either of them exists.
 *
 *  Undefined everywhere in production — the chaos wrapper is a no-op there
 *  structurally, and `proxy.ts` does not set the header at all. */
export async function requestChaos(): Promise<Plan | undefined> {
  if (process.env.NODE_ENV === "production") return undefined;
  return parsePlan((await headers()).get(SEARCH_HEADER) ?? "");
}
