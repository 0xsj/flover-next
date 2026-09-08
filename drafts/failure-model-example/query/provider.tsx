"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { makeQueryClient } from "./client";

/** The client, made ONCE per mount and held in state.
 *
 *  Not a module-level singleton: on the server that would be one cache shared
 *  by every request, which is one user's data served to the next. `useState`
 *  with an initialiser gives each browser its own and survives re-render
 *  without rebuilding it. */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(makeQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
