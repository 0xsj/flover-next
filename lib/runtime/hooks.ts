"use client";

import { useEffect, useSyncExternalStore } from "react";
import { density, hydrateDensity, type Density } from "./density";
import { interaction } from "./interaction";
import type { Store } from "./store";
import { hydrateTheme, resolvedTheme, theme, type Theme } from "./theme";

/* The ONLY file in this tier that imports a framework.
 *
 * Everything else here is a plain store, so the state machines and the
 * persistence copy verbatim into the Solid and Svelte siblings; each binds with
 * its own three lines. `useSyncExternalStore` is React's, and `getServerSnapshot`
 * is what keeps the server rendering the default rather than reading storage it
 * does not have. */

function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.server);
}

/** Reads the stored preference once, after mount.
 *
 *  Never during render: the server has no storage, so a value read there is a
 *  hydration mismatch — the class of bug that shows as a flash of the wrong
 *  theme and then corrects itself. */
export function useHydrateRuntime(): void {
  useEffect(() => {
    hydrateTheme();
    hydrateDensity();
  }, []);
}

export function useTheme(): {
  choice: Theme;
  resolved: "light" | "dark";
  set: (next: Theme) => void;
} {
  const choice = useStore(theme);
  return { choice, resolved: resolvedTheme(choice), set: theme.set };
}

export function useDensity(): { value: Density; set: (next: Density) => void } {
  return { value: useStore(density), set: density.set };
}

/** The id, for a surface that wants to show it. Starting one is an event
 *  handler's job, not a hook's — a render is not a user action. */
export function useInteraction(): string {
  return useStore(interaction);
}
