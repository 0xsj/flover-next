import { describe, expect, it } from "vitest";
import { AppError, asFailure, err, notFound, ok, rateLimited, timeout, unauthenticated } from "../kernel";
import { createMemoryClient, type MemoryRoute } from "../http";
import { NO_DEFAULT, type Item } from "../services/example";
import { defaultItemQuery, itemsQuery, keys, makeQueryClient } from ".";

const items: Item[] = [{ id: "i1", name: "api", host: "api.example.com" }];
const routes: MemoryRoute[] = [
  { method: "GET", pattern: /^\/items$/, handle: () => ok(items) },
  { method: "GET", pattern: /^\/workspaces\/none\/default-item$/, handle: () =>
      err(notFound("none", { status: 404, type: NO_DEFAULT })) },
];
const client = createMemoryClient({ routes, latencyMs: 0 });

const defaults = makeQueryClient().getDefaultOptions().queries!;
const wrap = (f: unknown) => new AppError(asFailure(f));
const shouldRetry = (n: number, f: unknown) =>
  (defaults.retry as (a: number, e: unknown) => boolean)(n, wrap(f));
const waitFor = (n: number, f: unknown) =>
  (defaults.retryDelay as (a: number, e: unknown) => number)(n, wrap(f));

describe("the policy asks the kernel, never a status code", () => {
  it("retries a timeout, with backoff", () => {
    expect(shouldRetry(0, timeout("slow"))).toBe(true);
    expect(waitFor(0, timeout("slow"))).toBe(250);
    expect(waitFor(2, timeout("slow"))).toBe(1_000);
  });

  it("honours the server's own retry-after", () => {
    expect(waitFor(0, rateLimited("slow down", 12))).toBe(12_000);
  });

  it("never retries an ANSWER", () => {
    for (const f of [unauthenticated("in"), notFound("gone"), { kind: "canceled" as const, message: "x" }]) {
      expect(shouldRetry(0, f)).toBe(false);
    }
  });

  it("gives up after two attempts, and never retries a write", () => {
    expect(shouldRetry(2, timeout("slow"))).toBe(false);
    expect(makeQueryClient().getDefaultOptions().mutations?.retry).toBe(false);
  });
});

describe("queryOptions pairs the key with its fetcher", () => {
  it("a query resolves to the service's value", async () => {
    const q = itemsQuery(client, "w1");
    expect(q.queryKey).toEqual(keys.example.all("w1"));
    await expect(q.queryFn!({} as never)).resolves.toEqual(items);
  });

  it("a failure becomes a rejection carrying the failure", async () => {
    const q = itemsQuery(createMemoryClient({ routes: [], latencyMs: 0 }), "w1");
    await expect(q.queryFn!({} as never)).rejects.toBeInstanceOf(AppError);
    try {
      await q.queryFn!({} as never);
    } catch (e) {
      expect(asFailure(e).kind).toBe("internal");
      expect(asFailure(e).type).toBe("unserved_route");
    }
  });

  it("looked and found nothing is a SUCCESS, never an error branch", async () => {
    const q = defaultItemQuery(client, "none");
    await expect(q.queryFn!({} as never)).resolves.toBeNull();
  });
});

describe("keys are hierarchical, so one invalidation reaches the reads", () => {
  it("the domain root is a prefix of every key under it", () => {
    const root = keys.example.root();
    for (const k of [keys.example.all("w1"), keys.example.one("i1"), keys.example.default("w1")]) {
      expect(k.slice(0, root.length)).toEqual(root);
    }
  });
});
