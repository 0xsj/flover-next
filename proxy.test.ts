// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { NextResponse, type NextRequest } from "next/server";
import { proxy } from "./proxy";
import { PATH_HEADER, SEARCH_HEADER } from "./app/_lib/request";

vi.mock("next/server", () => ({ NextResponse: { next: vi.fn() } }));
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

it.each(["development", "production"])("overwrites the return path and scopes chaos metadata in %s", environment => {
  vi.stubEnv("NODE_ENV", environment);
  const url = new URL("https://flover.invalid/cookbook/activity?page=2&chaos=GET%20/me/activity=empty:list");
  proxy({ nextUrl: url, headers: new Headers({ [PATH_HEADER]: "//other.example", [SEARCH_HEADER]: "?chaos=*=hang" }) } as unknown as NextRequest);
  const headers = vi.mocked(NextResponse.next).mock.calls[0][0]?.request?.headers as Headers;
  expect(headers.get(PATH_HEADER)).toBe(url.pathname + url.search);
  expect(headers.get(SEARCH_HEADER)).toBe(environment === "production" ? null : url.search);
});
