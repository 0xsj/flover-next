import { createFetchClient, createMemoryClient, type HttpClient } from "@/lib/http";
import { routes } from "./fixtures";

/* The composition root — the ONLY file that picks an adapter.
 *
 * Every example below takes a client rather than building one, which is the
 * rule that keeps `services` free of any transport decision. In the real tree
 * this also reads the session cookie and decides per domain; here it is the
 * smallest thing that is still honest. */

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export function clientFor(token: string | null = null): HttpClient {
  return baseUrl
    ? createFetchClient({ baseUrl, getAccessToken: () => token })
    : createMemoryClient({ routes, getAccessToken: () => token, latencyMs: 60 });
}

/** Whether what a screen is about to render came from a fixture. A badge hangs
 *  off this and nothing else. */
export const usingFixtures = !baseUrl;
