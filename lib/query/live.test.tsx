import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { ok } from "../kernel";
import { createMemorySource } from "../realtime";
import { useLiveQueries } from "./live";
import { useResourceQuery } from "./resource";

afterEach(() => { vi.useRealTimers(); });
it("coalesces relevant events, leaves other data alone, resyncs missed events, and cancels pending work", async () => {
  vi.useFakeTimers();
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity, gcTime: Infinity } } });
  const source = createMemorySource<{ resource: string }>();
  const key = ["live"] as const, other = ["unrelated"] as const;
  const resync = [key];
  const affected = (event: { resource: string }) => event.resource === "live" ? resync : [];
  let revision = 0;
  const read = vi.fn(async () => ok(revision));
  const readOther = vi.fn(async () => ok("stable"));
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={cache}>{children}</QueryClientProvider>;
  const hook = renderHook(() => {
    const query = useResourceQuery({ key, read });
    useResourceQuery({ key: other, read: readOther });
    const live = useLiveQueries({ source, affected, resync, batchMs: 20 });
    return { query, live };
  }, { wrapper });
  await act(async () => { await vi.advanceTimersByTimeAsync(30); });
  const baseline = read.mock.calls.length;
  expect(readOther).toHaveBeenCalledTimes(1);
  await act(async () => {
    source.publish({ resource: "other" });
    for (let i = 0; i < 5; i++) { revision++; source.publish({ resource: "live" }); }
    await vi.advanceTimersByTimeAsync(30);
  });
  expect(read).toHaveBeenCalledTimes(baseline + 1);
  expect(readOther).toHaveBeenCalledTimes(1);
  expect(cache.getQueryData(key)).toBe(5);
  await act(async () => { source.disconnect(); revision = 9; source.publish({ resource: "live" }); await vi.advanceTimersByTimeAsync(30); });
  expect(cache.getQueryData(key)).toBe(5);
  expect(hook.result.current.live.connection.state).toBe("closed");
  await act(async () => { source.reconnect(); await vi.advanceTimersByTimeAsync(30); });
  expect(cache.getQueryData(key)).toBe(9);
  const beforeStop = read.mock.calls.length;
  act(() => { source.publish({ resource: "live" }); });
  hook.unmount();
  source.publish({ resource: "live" });
  await vi.advanceTimersByTimeAsync(50);
  expect(read).toHaveBeenCalledTimes(beforeStop);
  cache.clear();
});
