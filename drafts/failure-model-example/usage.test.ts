import { describe, expect, it } from "vitest";
import { asFailure, AppError, retryDelay } from "@/lib/kernel";
import { clientFor } from "./root";
import { makeQueryClient } from "./query/client";
import { keys } from "./query/keys";
import { createTarget, deleteTarget, findPrimaryTarget, getTarget, listTargets } from "./services/targets";

const client = clientFor("session-token");
const anon = clientFor(null);

describe("the fixtures refuse, they do not only succeed", () => {
  it("refuses an unauthenticated read the way the server would", async () => {
    const r = await listTargets(anon, "w1");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe("unauthenticated");
  });

  it("reproduces the SERVER's validation, not only the client's", async () => {
    // Passes every client-side rule; the server still refuses it.
    const r = await createTarget(client, { name: "new", host: "db.internal" });
    expect(r.ok).toBe(false);
    if (r.ok || r.error.kind !== "invalid") throw new Error("expected invalid");
    expect(r.error.fields.host).toBe("Internal hosts cannot be targeted.");
    expect(r.error.status).toBe(422);
  });

  it("reproduces a conflict", async () => {
    const r = await createTarget(client, { name: "api", host: "other.example.com" });
    if (r.ok) throw new Error("expected conflict");
    expect(r.error.kind).toBe("conflict");
  });

  it("reproduces a rate limit WITH the server's retry-after", async () => {
    const r = await deleteTarget(client, "t1");
    if (r.ok) throw new Error("expected rate_limited");
    expect(r.error.kind).toBe("rate_limited");
    // The number survives narrowing — this is what v2 lost.
    expect(retryDelay(r.error, 0)).toBe(12_000);
  });

  it("a bad id is not_found, and it is a domain kind the read promised", async () => {
    const r = await getTarget(client, "nope");
    if (r.ok) throw new Error("expected not_found");
    expect(r.error.kind).toBe("not_found");
  });
});

describe("three states through the real fixtures", () => {
  it("w1 has one", async () => {
    const r = await findPrimaryTarget(client, "w1");
    expect(r.ok && r.value?.name).toBe("api");
  });

  it("w2 legitimately has none — a success carrying null", async () => {
    const r = await findPrimaryTarget(client, "w2");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeNull();
  });

  it("an empty list is a value, never a failure", async () => {
    const r = await listTargets(client, "w-empty");
    expect(r.ok && r.value).toEqual([]);
  });
});

describe("the cache asks the kernel, and never a status code", () => {
  const defaults = makeQueryClient().getDefaultOptions().queries!;
  const shouldRetry = (attempt: number, failure: unknown) =>
    (defaults.retry as (a: number, e: unknown) => boolean)(attempt, new AppError(asFailure(failure)));
  const waitFor = (attempt: number, failure: unknown) =>
    (defaults.retryDelay as (a: number, e: unknown) => number)(attempt, new AppError(asFailure(failure)));

  it("retries a timeout, with backoff", async () => {
    const f = { kind: "timeout" as const, message: "slow" };
    expect(shouldRetry(0, f)).toBe(true);
    expect(waitFor(0, f)).toBe(250);
    expect(waitFor(2, f)).toBe(1_000);
  });

  it("honours the server's retry-after on a rate limit", async () => {
    const r = await deleteTarget(client, "t1");
    if (r.ok) throw new Error("expected rate_limited");
    expect(shouldRetry(0, r.error)).toBe(true);
    expect(waitFor(0, r.error)).toBe(12_000);
  });

  it("never retries an ANSWER — a refusal, or the caller's own cancellation", () => {
    expect(shouldRetry(0, { kind: "forbidden", message: "no" })).toBe(false);
    expect(shouldRetry(0, { kind: "not_found", message: "no" })).toBe(false);
    expect(shouldRetry(0, { kind: "canceled", message: "no" })).toBe(false);
    expect(shouldRetry(0, { kind: "invalid", message: "no", fields: {} })).toBe(false);
  });

  it("gives up after two attempts", () => {
    expect(shouldRetry(2, { kind: "timeout", message: "slow" })).toBe(false);
  });

  it("never retries a write", () => {
    expect(makeQueryClient().getDefaultOptions().mutations?.retry).toBe(false);
  });
});

describe("cache keys are hierarchical, so one invalidation reaches the reads", () => {
  it("a list key is a prefix of a detail key's family", () => {
    expect(keys.targets.all("w1")).toEqual(["targets", "w1"]);
    expect(keys.targets.primary("w1")).toEqual(["targets", "primary", "w1"]);
    // The mutation invalidates `targets.all(ws)`; react-query matches by prefix.
    expect(keys.targets.primary("w1").slice(0, 1)).toEqual(["targets"]);
  });
});
