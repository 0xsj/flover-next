"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { err, internal, ok, type Result } from "../kernel";
import type { QuerySchema } from "../url-state";

export type HistoryMode = "push" | "replace";

/** Read/write are exposed separately so browser failure and event-time merging
 * can be tested without a router. The hook is the only framework binding. */
export function writeQueryState<T>(schema: QuerySchema<T>, change: (current: T) => T, mode: HistoryMode = "push"): Result<void> {
  try {
    const current = window.location;
    const result = schema.update(current.search, change);
    if (!result.ok) return err(result.error);
    const query = result.value.toString();
    const href = `${current.pathname}${query ? `?${query}` : ""}${current.hash}`;
    if (href !== `${current.pathname}${current.search}${current.hash}`) {
      // Next adds its own metadata. Passing existing __NA state would make its
      // patched history method skip the useSearchParams update entirely.
      window.history[mode === "replace" ? "replaceState" : "pushState"](null, "", href);
    }
    return ok(undefined);
  } catch {
    return err(internal("The browser could not update this view’s address. Try again.", { type: "url_state_unavailable" }));
  }
}

export function useUrlState<T>(schema: QuerySchema<T>) {
  const search = useSearchParams().toString();
  const pathname = usePathname();
  const parsed = useMemo(() => schema.read(search), [schema, search]);
  const update = useCallback((change: (current: T) => T, mode?: HistoryMode) => writeQueryState(schema, change, mode), [schema]);
  return { ...parsed, update, path: `${pathname}${search ? `?${search}` : ""}` };
}
