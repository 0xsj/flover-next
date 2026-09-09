import { ok, type Result, type Failure } from "@/lib/kernel";
import { createMemoryClient, type MemoryRoute } from "@/lib/http";
import type { HttpClient } from "@/lib/http";

/** The smallest real thing to break: one route, one service, one shape. */
export type Row = { id: string; name: string };

const rows: Row[] = [
  { id: "t1", name: "api.example.com" },
  { id: "t2", name: "www.example.com" },
];

const routes: MemoryRoute[] = [
  { method: "GET", pattern: /^\/demo$/, handle: () => ok(rows) },
];

export const demoClient = (): HttpClient => createMemoryClient({ routes, latencyMs: 120 });

export const listRows = (client: HttpClient): Promise<Result<Row[], Failure>> =>
  client.get<Row[]>("/demo");
