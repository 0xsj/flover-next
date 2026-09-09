import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* The detection for the one rule this design cannot express in a type.
 *
 * `Result` is a class, so its methods do not survive serialisation. Returning
 * one from a Server Action, or passing one to a client component, compiles
 * fine and fails at runtime — which is exactly the class of defect the failure
 * model exists to make unrepresentable. A rule with no check is a preference,
 * so this is the check.
 *
 * What it CANNOT catch, stated because a test listing only its catches gets
 * read as a guarantee:
 *   · a Result reached through an alias or an inferred return type
 *   · a Result nested inside another returned object
 *   · a client component receiving one as a prop, which is a different
 *     direction and would need the caller's file, not the callee's
 * It catches the shape that actually gets written. */

const ROOTS = ["app", "lib", "components", "drafts"];
const RESULT_IN_RETURN = /:\s*Promise<\s*Result\s*</;

async function* walk(dir: string): AsyncGenerator<string> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      yield* walk(full);
    } else if (/\.tsx?$/.test(e.name)) {
      yield full;
    }
  }
}

describe("a Result never crosses the server/client boundary", () => {
  it("no \"use server\" file returns one", async () => {
    const offenders: string[] = [];

    for (const root of ROOTS) {
      for await (const file of walk(path.join(process.cwd(), root))) {
        const source = await readFile(file, "utf8");
        const directive = source.slice(0, 200);
        if (!/^\s*["']use server["']/m.test(directive)) continue;
        if (RESULT_IN_RETURN.test(source)) {
          offenders.push(path.relative(process.cwd(), file));
        }
      }
    }

    expect(offenders, "unwrap into an explicit form state before returning").toEqual([]);
  });

  it("the check can actually see a violation", () => {
    // Guards against the walk silently reading zero files, which would make
    // this a green line about nothing.
    const sample = `"use server";\nexport async function a(): Promise<Result<number>> { return ok(1); }`;
    expect(/^\s*["']use server["']/m.test(sample.slice(0, 200))).toBe(true);
    expect(RESULT_IN_RETURN.test(sample)).toBe(true);
  });

  it("reads a non-zero number of files", async () => {
    let seen = 0;
    for (const root of ROOTS) {
      for await (const _f of walk(path.join(process.cwd(), root))) seen++;
    }
    expect(seen).toBeGreaterThan(20);
  });
});

/* The portable tiers stay portable.
 *
 * `lib/kernel` and `lib/http` are plain TypeScript with no framework and no
 * alias, which is what makes them copyable verbatim into the Solid and Svelte
 * siblings — the alias is the one thing CLAUDE.md says cannot be shared
 * (`@/` here, `$lib` there, `~/` in the third). A single `@/` import is the
 * difference between "the same design" and "the same bytes", and it is the kind
 * of thing that gets added without anyone noticing. */
describe("lib/kernel and lib/http are copyable between the siblings", () => {
  const PORTABLE = ["lib/kernel", "lib/http", "lib/chaos", "lib/root"];

  async function sources(): Promise<Array<{ file: string; text: string }>> {
    const out: Array<{ file: string; text: string }> = [];
    for (const dir of PORTABLE) {
      for await (const file of walk(path.join(process.cwd(), dir))) {
        if (/\.test\.tsx?$/.test(file)) continue;
        out.push({ file: path.relative(process.cwd(), file), text: await readFile(file, "utf8") });
      }
    }
    return out;
  }

  it("import no framework", async () => {
    const offenders = (await sources())
      .filter((s) => /from ["'](react|react-dom|next(\/|")|@tanstack|svelte|solid-js)/.test(s.text))
      .map((s) => s.file);
    expect(offenders, "a framework import makes this tier unportable").toEqual([]);
  });

  it("use no path alias", async () => {
    const offenders = (await sources())
      .filter((s) => /from ["']@\//.test(s.text))
      .map((s) => s.file);
    expect(offenders, "use a relative import; the alias differs per sibling").toEqual([]);
  });

  it("reads the files it claims to", async () => {
    expect((await sources()).length).toBeGreaterThan(6);
  });
});
