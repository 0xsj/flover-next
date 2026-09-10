"use client";

import { useMemo } from "react";
import { parsePlan } from "@/lib/chaos";
import { createRoot, type Root } from "@/lib/root";

/* The browser's transport, in one place.
 *
 * The session cookie is HttpOnly, so the page holds no bearer and does not call
 * the API. It calls this application's own route handlers on the same origin,
 * where the cookie rides along automatically — and those answer in the problem
 * document `lib/http` decodes, so what arrives is the same `Failure` the server
 * had.
 *
 * `globalThis.location` rather than a `typeof window` branch: the base url is
 * only read inside a request, a query never runs during a server render, so the
 * empty string on the server is never used and nothing about it reaches the DOM.
 *
 * The chaos plan comes from the same query string the proxy hands the server,
 * read here instead — so one `?chaos=` link breaks both paths on a page and the
 * two failure surfaces can be compared.
 *
 * Memoised, because a root per render is a correlation id per render, which is
 * a second request id with extra steps. */
export function useBrowserRoot(): Root {
  return useMemo(
    () =>
      createRoot({
        /* Every domain goes to the network here, because "the network" IS this
           application's own route handlers — the browser has no fixtures and no
           bearer, so there is nothing else it could ask. */
        baseUrl: `${globalThis.location?.origin ?? ""}/api`,
        chaos: parsePlan(globalThis.location?.search ?? ""),
      }),
    [],
  );
}
