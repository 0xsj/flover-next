"use client";

import { useEffect } from "react";
import { hydrateDensity, hydrateTheme } from "@/lib/runtime";

/** Iframe previews have their own runtime stores. Storage events keep their
 * controls and the gallery's controls in agreement without sharing React state. */
export function usePreviewPreferences() {
  useEffect(() => {
    hydrateTheme();
    hydrateDensity();
    const sync = (event: StorageEvent) => {
      if (event.key === "theme" || event.key === null) hydrateTheme();
      if (event.key === "density" || event.key === null) hydrateDensity();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
}
