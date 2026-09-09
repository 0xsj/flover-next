import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { createMemoryClient } from "../http";
import { keys, makeQueryClient, useRevokeSession, useSessions } from ".";
import {
  DEMO_CREDENTIALS, resetSessionFixtures, sessionRoutes, signIn,
  type SessionSummary,
} from "../services/session";
import { parsePlan, withChaos } from "../chaos";

/* The optimistic write, asserted at the level it actually goes wrong.
 *
 * Three claims, and the third is the one nobody writes:
 *   the row leaves the list BEFORE the server answers
 *   a refusal puts it back
 *   `not_found` does NOT put it back, because the removal was right
 *
 * A rollback that is wrong is worse than no rollback: it puts a dead row back
 * on screen and tells the reader their action failed after it had happened. */

let token = "";

const clientFor = (chaos?: string) => {
  const base = createMemoryClient({
    routes: sessionRoutes, getAccessToken: () => token, latencyMs: 0,
  });
  return chaos ? withChaos(base, parsePlan(chaos), "cid-test") : base;
};

beforeEach(async () => {
  resetSessionFixtures();
  const bootstrap = createMemoryClient({ routes: sessionRoutes, latencyMs: 0 });
  const a = await signIn(bootstrap, DEMO_CREDENTIALS);
  const b = await signIn(bootstrap, DEMO_CREDENTIALS);
  if (!a.ok || !b.ok) throw new Error("sign-in should have succeeded");
  token = b.value.token;
});

function harness(chaos?: string) {
  const cache = makeQueryClient();
  cache.setDefaultOptions({ queries: { retry: false }, mutations: { retry: false } });
  const client = clientFor(chaos);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={cache}>{children}</QueryClientProvider>
  );
  const rows = () => cache.getQueryData<SessionSummary[]>(keys.session.all()) ?? [];
  return { cache, client, wrapper, rows };
}

describe("an optimistic revoke", () => {
  it("removes the row before the server has answered", async () => {
    const { client, wrapper, rows } = harness();
    const { result } = renderHook(
      () => ({ read: useSessions(client), write: useRevokeSession(client) }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.read.data).toHaveLength(2));
    const other = rows().find((r) => !r.current)!;

    await act(async () => {
      result.current.write.mutate(other.id);
      // Not awaited: this is the frame between the click and the answer.
      await Promise.resolve();
    });
    expect(rows().some((r) => r.id === other.id)).toBe(false);

    await waitFor(() => expect(result.current.write.isSuccess).toBe(true));
    await waitFor(() => expect(rows()).toHaveLength(1));
  });

  it("a refusal puts the row back", async () => {
    const { client, wrapper, rows } = harness();
    const { result } = renderHook(
      () => ({ read: useSessions(client), write: useRevokeSession(client) }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.read.data).toHaveLength(2));

    // Revoking the CURRENT session is a conflict — a real refusal, not forced.
    const mine = rows().find((r) => r.current)!;
    await act(async () => {
      result.current.write.mutate(mine.id);
    });
    await waitFor(() => expect(result.current.write.isError).toBe(true));
    await waitFor(() => expect(rows().some((r) => r.id === mine.id)).toBe(true));
  });

  it("but not_found does NOT put it back — the removal was right", async () => {
    const { client, wrapper, rows } = harness();
    const { result } = renderHook(
      () => ({ read: useSessions(client), write: useRevokeSession(client) }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.read.data).toHaveLength(2));
    const other = rows().find((r) => !r.current)!;

    // Ended elsewhere first, so the write meets a session that is already gone.
    await act(async () => { result.current.write.mutate(other.id); });
    await waitFor(() => expect(result.current.write.isSuccess).toBe(true));

    await act(async () => { result.current.write.mutate(other.id); });
    await waitFor(() => expect(result.current.write.isError).toBe(true));
    expect(rows().some((r) => r.id === other.id)).toBe(false);
  });

  it("a transport failure rolls back like any other refusal", async () => {
    // `*` covers a segment run — the id is not known until the list has loaded.
    const { client, wrapper, rows } = harness("?chaos=DELETE /auth/sessions/*=fail:unavailable");
    const { result } = renderHook(
      () => ({ read: useSessions(client), write: useRevokeSession(client) }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.read.data).toHaveLength(2));
    const other = rows().find((r) => !r.current)!;

    await act(async () => { result.current.write.mutate(other.id); });
    await waitFor(() => expect(result.current.write.isError).toBe(true));
    expect(rows().some((r) => r.id === other.id)).toBe(true);
  });

  it("the server has the last word: the list is invalidated either way", async () => {
    const { cache, client, wrapper } = harness();
    const { result } = renderHook(
      () => ({ read: useSessions(client), write: useRevokeSession(client) }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.read.data).toHaveLength(2));

    const before = cache.getQueryState(keys.session.all())!.dataUpdatedAt;
    await act(async () => {
      result.current.write.mutate(cache.getQueryData<SessionSummary[]>(keys.session.all())!
        .find((r) => !r.current)!.id);
    });
    await waitFor(() =>
      expect(cache.getQueryState(keys.session.all())!.dataUpdatedAt).toBeGreaterThan(before),
    );
  });
});
