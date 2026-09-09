import { beforeEach, describe, expect, it, vi } from "vitest";
import { failureFromResponse } from "@/lib/http";
import { conflict, invalid, rateLimited, unauthenticated } from "@/lib/kernel";
import { DEMO_CREDENTIALS, resetSessionFixtures, signIn } from "@/lib/services/session";
import { createMemoryClient } from "@/lib/http";
import { sessionRoutes } from "@/lib/services/session";

/* The route handler is a SERVER that speaks this client's contract.
 *
 * That claim is the whole reason a browser-side read can use the same fetch
 * adapter, the same decoder and the same failure vocabulary as the server does.
 * It is worth an actual round trip rather than a comment: build the response the
 * handler builds, hand it to the decoder the adapter uses, and require the
 * Failure that comes out to be the one that went in. */

const jar = new Map<string, string>();
const requestHeaders = new Headers();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined),
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name),
  }),
  headers: async () => requestHeaders,
}));

const { GET } = await import("./route");

beforeEach(() => {
  jar.clear();
  requestHeaders.delete("x-flover-search");
  resetSessionFixtures();
});

describe("the browser's door", () => {
  it("answers a signed-in caller with the list", async () => {
    const client = createMemoryClient({ routes: sessionRoutes, latencyMs: 0 });
    const session = await signIn(client, DEMO_CREDENTIALS);
    if (!session.ok) return expect.unreachable("sign-in should have succeeded");
    jar.set("flover_session", session.value.token);

    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].current).toBe(true);
  });

  it("names the interaction on the way out", async () => {
    const response = await GET();
    expect(response.headers.get("x-correlation-id")).toBeTruthy();
  });

  it("a refusal carries the REAL status, not a blanket 500", async () => {
    // So a proxy, a log and a devtools panel agree with the body — and so a
    // decoder with no body to read classifies it the same way.
    const response = await GET();          // no cookie: unauthenticated
    expect(response.status).toBe(401);
  });

  it("and the decoder the adapter uses reads it back as the same Failure", async () => {
    const response = await GET();
    const failure = await failureFromResponse(response.clone());
    expect(failure.kind).toBe("unauthenticated");
    expect(failure.message).toBe("Sign in to continue.");
    expect(failure.correlationId).toBeTruthy();
  });

  it("a forced failure travels the same way", async () => {
    requestHeaders.set("x-flover-search", "?chaos=GET /auth/sessions=fail:rate_limited");
    const response = await GET();
    const failure = await failureFromResponse(response.clone());
    expect(failure.kind).toBe("rate_limited");
    // The retry-after survives the trip, which is what a cache needs from it.
    expect(failure.kind === "rate_limited" && failure.retryAfter).toBeGreaterThan(0);
  });
});

describe("the wire shape the decoder expects", () => {
  /* A guard on the handler's serialiser rather than on the decoder: these are
     the keys `lib/http/envelope.ts` reads, and getting one wrong produces a
     failure that decodes to `internal` with the message lost — which reads as a
     server problem rather than as a typo here. */
  it("puts kind at the top level and metadata in snake_case", async () => {
    const response = await GET();
    const body = await response.json();
    expect(body).toHaveProperty("kind");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("correlation_id");
  });

  it("the decoder is liberal enough that all four kinds survive it", async () => {
    for (const failure of [
      unauthenticated("no", { status: 401 }),
      conflict("taken", { status: 409 }),
      rateLimited("slow", 12, { status: 429 }),
      invalid("check", { email: "bad" }, { status: 422 }),
    ]) {
      const body = {
        kind: failure.kind, message: failure.message, correlation_id: "cid-1",
        ...(failure.kind === "rate_limited" ? { retry_after: failure.retryAfter } : {}),
        ...(failure.kind === "invalid" ? { fields: failure.fields } : {}),
      };
      const decoded = await failureFromResponse(
        new Response(JSON.stringify(body), { status: failure.status! }),
      );
      expect(decoded.kind, failure.kind).toBe(failure.kind);
      expect(decoded.message).toBe(failure.message);
    }
  });
});
