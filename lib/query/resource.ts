"use client";

import { useQuery } from "@tanstack/react-query";
import { unwrap, type Result } from "../kernel";
import type { CacheKey } from "./live";

/** Caller-owned service/read function, with the same cache boundary and policy. */
export function useResourceQuery<T>({ key, read }: {
  key: CacheKey;
  read: (signal: AbortSignal) => Promise<Result<T>>;
}) {
  return useQuery({ queryKey: key, queryFn: async ({ signal }) => unwrap(await read(signal)) });
}
