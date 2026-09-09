import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/kernel";
import { DEMO_CREDENTIALS, resetSessionFixtures, sessionRoutes, signIn } from "@/lib/services/session";
import { createMemoryClient } from "@/lib/http";
import { SESSION_COOKIE } from "@/app/_lib/session";

/* The guard, and the bug it used to have.
 *
 * `if (!me.ok) redirect("/sign-in")` branched on OK rather than on the KIND, so
 * an unreachable server sent the reader to a sign-in form that would fail for
 * the same reason — and lost their place on the way. Two ways not to have a
 * user, and they end differently. */

const jar = new Map<string, string>();
const requestHeaders = new Headers();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined),
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name),
  }),
  headers: async () => requestHeaders,
}));

class Redirected extends Error {
  constructor(readonly to: string) { super(`redirect:${to}`); }
}
vi.mock("next/navigation", () => ({
  redirect: (to: string) => { throw new Redirected(to); },
}));

const { currentSession, optionalUser, requireUser } = await import("./root");

/** Three outcomes, and naming which one was reached is the whole test. */
async function guard(): Promise<
  { outcome: "user"; email: string } | { outcome: "redirect"; to: string } | { outcome: "threw"; kind: string }
> {
  try {
    const user = await requireUser();
    return { outcome: "user", email: user.email };
  } catch (e) {
    if (e instanceof Redirected) return { outcome: "redirect", to: e.to };
    if (e instanceof AppError) return { outcome: "threw", kind: e.failure.kind };
    throw e;
  }
}

const signedIn = async () => {
  const client = createMemoryClient({ routes: sessionRoutes, latencyMs: 0 });
  const session = await signIn(client, DEMO_CREDENTIALS);
  if (!session.ok) throw new Error("sign-in should have succeeded");
  jar.set(SESSION_COOKIE, session.value.token);
};

beforeEach(() => {
  jar.clear();
  requestHeaders.delete("x-flover-search");
  resetSessionFixtures();
  vi.resetModules();
});

describe("who is signed in, as three states", () => {
  it("no cookie is EMPTY — nobody is signed in", async () => {
    expect(await currentSession()).toEqual({ state: "empty" });
  });

  it("a good bearer is FOUND", async () => {
    await signedIn();
    const session = await currentSession();
    expect(session.state).toBe("found");
  });

  it("a bad bearer is EMPTY, because the server answered", async () => {
    // An invented token is not "we could not find out" — the server told us.
    jar.set(SESSION_COOKIE, "tok_invented");
    expect((await currentSession()).state).toBe("empty");
  });

  it("an unreachable server is UNMEASURED, not empty", async () => {
    // The distinction the whole thing exists for. Collapsing this into "empty"
    // is what the old code did.
    await signedIn();
    requestHeaders.set("x-flover-search", "?chaos=GET /auth/me=fail:unavailable");
    const session = await currentSession();
    expect(session.state).toBe("unmeasured");
    if (session.state === "unmeasured") expect(session.failure.kind).toBe("unavailable");
  });
});

describe("the guard ends three ways", () => {
  it("a signed-in reader gets their user", async () => {
    await signedIn();
    expect(await guard()).toEqual({ outcome: "user", email: DEMO_CREDENTIALS.email });
  });

  it("nobody signed in is a REDIRECT — go and sign in, it will work", async () => {
    expect(await guard()).toEqual({ outcome: "redirect", to: "/sign-in" });
  });

  it("an expired or invented token is also a redirect", async () => {
    jar.set(SESSION_COOKIE, "tok_invented");
    expect(await guard()).toEqual({ outcome: "redirect", to: "/sign-in" });
  });

  it("an unreachable server THROWS, so the boundary renders it", async () => {
    /* The bug, pinned. Sending somebody to a sign-in form because the server is
       down is a lie that also loses their place — and the form would fail the
       same way. `AppError` is the kernel's one sanctioned throw. */
    await signedIn();
    requestHeaders.set("x-flover-search", "?chaos=GET /auth/me=fail:unavailable");
    expect(await guard()).toEqual({ outcome: "threw", kind: "unavailable" });
  });

  it("a timeout throws too — anything that is not an answer about identity", async () => {
    await signedIn();
    requestHeaders.set("x-flover-search", "?chaos=GET /auth/me=fail:timeout");
    expect(await guard()).toEqual({ outcome: "threw", kind: "timeout" });
  });

  it("and forbidden is still a redirect, because it IS an answer", async () => {
    await signedIn();
    requestHeaders.set("x-flover-search", "?chaos=GET /auth/me=fail:forbidden");
    expect(await guard()).toEqual({ outcome: "redirect", to: "/sign-in" });
  });
});

describe("optionalUser flattens deliberately", () => {
  it("an unmeasured session reads as signed out for a surface that may carry on", async () => {
    // Safe for a public page, and it would be wrong in the guard — which is why
    // the guard does not use this.
    await signedIn();
    requestHeaders.set("x-flover-search", "?chaos=GET /auth/me=fail:unavailable");
    expect(await optionalUser()).toBeNull();
  });
});
