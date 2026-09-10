// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm, symlink } from "node:fs/promises";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkArchitecture, changedFiles, exitCode, inventory } from "./check.mjs";
import { POLICY, RULES, validateRules } from "./rules.mjs";

// Implementation-aware negative controls. These are not blind spec tests.
const temporary: string[] = [];
const cli = fileURLToPath(new URL("./cli.mjs", import.meta.url));
const mechanical = RULES.filter(rule => rule.mode === "mechanical").map(rule => rule.id);
const config = {
  compilerOptions: {
    target: "ES2022", module: "ESNext", moduleResolution: "Bundler",
    strict: true, noEmit: true, incremental: true, jsx: "preserve",
    allowJs: true, types: [], lib: ["ES2022", "DOM"], skipLibCheck: true,
    paths: { "@/*": ["./*"], "local/*": ["./lib/*"] },
  },
  include: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.mjs", "**/*.cjs", "**/*.mts", "**/*.cts"],
};
const support = {
  "tsconfig.json": JSON.stringify(config),
  "app/types.d.ts": `
    declare namespace JSX { interface IntrinsicElements { [tag: string]: any } }
    declare function require(name: string): any;
    declare module "react" { export function useState(value: number): number; }
    declare module "lucide-react" { export function Icon(): void; }
    declare module "radix-ui" { export const Button: string; }
    declare module "@tanstack/react-query" { export function useQuery(): void; }
    declare module "@internationalized/date" { export function parseDate(value: string): string; }
  `,
  "lib/kernel/unit.ts": "export const unit = 1;",
  "lib/kernel/result.ts": `
    export class Ok<T> { readonly kind = "ok"; constructor(readonly value: T) {} }
    export class Err<E> { readonly kind = "err"; constructor(readonly error: E) {} }
    export type Result<T, E> = Ok<T> | Err<E>;
    export const ok = <T>(value: T): Ok<T> => new Ok(value);
  `,
  "lib/http/port.ts": "export interface HttpClient { get(url: string): Promise<string>; }",
  "lib/http/fetch-client.ts": "export function createFetchClient() { return { mode: 'fetch' }; }",
  "lib/http/index.ts": "export { createFetchClient } from './fetch-client';",
  "lib/services/example.ts": "export function read() { return 'data'; }",
};
async function put(root: string, files: Record<string, string>) {
  for (const [name, text] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), text);
  }
}
async function fixture(files: Record<string, string> = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "flover-architecture-"));
  temporary.push(root);
  await put(root, { ...support, ...files });
  return root;
}
function git(root: string, ...args: string[]) {
  return execFileSync("git", ["-c", "core.hooksPath=/dev/null", ...args], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}
function commit(root: string) {
  git(root, "add", ".");
  git(root, "-c", "user.name=Architecture Fixture", "-c", "user.email=fixture@example.invalid", "-c", "commit.gpgsign=false", "commit", "-qm", "fixture");
}
function startGit(root: string) { git(root, "init", "-q"); commit(root); }
async function check(root: string, all = true) {
  const report = await checkArchitecture({ root, all });
  expect(report.diagnostics).toEqual([]);
  return report;
}
afterEach(async () => { await Promise.all(temporary.splice(0).map(root => rm(root, { recursive: true, force: true }))); });

describe("architecture detectors", () => {
  it("catches a deliberate violation of every mechanical rule, with source evidence", async () => {
    const controls: Record<string, [string, string]> = {
      S1: ["lib/services/framework.ts", "import { useState } from 'react'; export const value = useState(1);"],
      S2: ["lib/services/alias.ts", "export { unit } from '@/lib/kernel/unit';"],
      S3: ["app/icons.ts", "export { Icon } from 'lucide-react';"],
      S4: ["components/patterns/domain.ts", "export { read } from '../../lib/services/example';"],
      S5: ["app/adapter.ts", "import { createFetchClient as make } from '../lib/http'; export const client = make();"],
      S6: ["app/transport.ts", "import type { HttpClient } from '../lib/http/port'; export const read = (http: HttpClient) => http.get('/api/data');"],
      E1: ["app/action.ts", "'use server'; import { ok } from '../lib/kernel/result'; export async function action() { return ok(1); }"],
      A1: ["app/page.tsx", "export const Page = () => <main suppressHydrationWarning />;"],
    };
    // Adding a mechanical rule without a failing input must fail this suite.
    expect(Object.keys(controls).sort()).toEqual([...mechanical].sort());
    const report = await check(await fixture(Object.fromEntries(Object.values(controls))));
    expect(exitCode(report)).toBe(1);
    for (const [id, [file]] of Object.entries(controls)) {
      expect(report.findings).toContainEqual(expect.objectContaining({ rule: id, file, line: 1, evidence: expect.any(String) }));
      expect(report.checks).toContainEqual(expect.objectContaining({ id, status: "violation" }));
    }
  });

  it("allows each boundary's legitimate counterpart without mistaking strings or Map.get for transport", async () => {
    const root = await fixture({
      "lib/services/local.ts": "import { unit } from '../kernel/unit'; export const value = unit;",
      "lib/services/transport.ts": "import type { HttpClient } from '../http/port'; export const read = (http: HttpClient) => http.get('/api/data');",
      "lib/http/request.ts": "export const send = () => fetch('/api/data');",
      "lib/root/index.ts": "import { createFetchClient } from '../http'; export const makeRoot = () => createFetchClient();",
      "components/utility/icon/icon.ts": "export { Icon } from 'lucide-react';",
      "components/forms/button.ts": "export { Button } from 'radix-ui';",
      "components/chrome/segmented.tsx": "export { Button } from 'radix-ui';",
      "components/forms/date-picker/date.ts": "export { parseDate } from '@internationalized/date';",
      "lib/query/index.ts": "export { useQuery } from '@tanstack/react-query';",
      "lib/runtime/store.ts": "export const theme = 'dark';",
      "components/chrome/theme.ts": "export { theme } from '../../lib/runtime/store';",
      "components/patterns/unit.ts": "export { unit } from '../../lib/kernel/unit';",
      "app/(dev)/kitchen-sink/_sections/query-case.tsx": "export { useQuery } from '@tanstack/react-query';",
      "app/action.ts": `
        'use server'; import { ok } from '../lib/kernel/result';
        function local() { return ok(1); }
        export async function action() { return { status: 'ok' as const, value: local().value }; }
      `,
      "app/layout.tsx": "export const Layout = () => <html suppressHydrationWarning />;",
      "app/page.tsx": `
        // import { Icon } from 'lucide-react';
        const example = "import { useQuery } from '@tanstack/react-query'";
        const values = new Map([['/api/data', example]]);
        export const Page = () => <a href='/api/data'>{values.get('/api/data')}</a>;
      `,
      "app/ignored.test.ts": "import 'not-a-real-package';",
    });
    const report = await check(root);
    expect(report.findings).toEqual([]);
    expect(report.checks.every(item => item.status === "verified")).toBe(true);
    expect(report.status).toBe("review_pending");
    expect(report.review.every(item => item.status === "needs_review")).toBe(true);
    expect(report.exceptions.applied).toHaveLength(1);
    expect(report.exceptions.unused).toEqual([]);
    expect(exitCode(report)).toBe(0);
  });

  it("parses import forms and resolves other local aliases, native fetch aliases, and literal JSX spreads", async () => {
    const report = await check(await fixture({
      "app/require.ts": "export const icon = require('lucide-react');",
      "app/dynamic.ts": "export const icons = () => import(`lucide-react`);",
      "app/import-type.ts": "export type Icon = typeof import('lucide-react').Icon;",
      "lib/services/local-alias.ts": "export { unit } from 'local/kernel/unit';",
      "lib/kernel/directive.ts": "'use client'; export const value = 1;",
      "app/fetch.ts": "const request = fetch; export const load = () => request('/api/data');",
      "app/spread.tsx": "export const Page = () => <div {...{ suppressHydrationWarning: true }} />;",
      "app/shadow.ts": "function require(name: string) { return name; } export const value = require('lucide-react');",
      "lib/http/memory-client.ts": "export const createMemoryClient = () => ({});",
      "app/memory.ts": "import { createMemoryClient } from '../lib/http/memory-client'; export const client = createMemoryClient();",
    }));
    for (const file of ["app/require.ts", "app/dynamic.ts", "app/import-type.ts"]) {
      expect(report.findings).toContainEqual(expect.objectContaining({ rule: "S3", file }));
    }
    for (const [rule, file] of [["S2", "lib/services/local-alias.ts"], ["S1", "lib/kernel/directive.ts"], ["S6", "app/fetch.ts"], ["A1", "app/spread.tsx"]]) {
      expect(report.findings).toContainEqual(expect.objectContaining({ rule, file }));
    }
    expect(report.findings.some(item => item.file === "app/shadow.ts")).toBe(false);
    expect(report.findings).toContainEqual(expect.objectContaining({ rule: "S5", file: "app/memory.ts" }));
  });

  it("catches aliased, nested, inline, and re-exported Result returns and exposes type-erased review gaps", async () => {
    const report = await check(await fixture({
      "app/alias.ts": "'use server'; import type { Result as Outcome } from '../lib/kernel/result'; import { ok } from '../lib/kernel/result'; export async function save(): Promise<Outcome<number, string>> { return ok(1); }",
      "app/nested.ts": "'use server'; import { ok } from '../lib/kernel/result'; export async function save() { return { rows: [ok(1)] }; }",
      "app/inline.ts": "import { ok } from '../lib/kernel/result'; export async function save() { 'use server'; return ok(1); }",
      "app/helper.ts": "import { ok } from '../lib/kernel/result'; export async function helper() { return ok(1); }",
      "app/reexport.ts": "'use server'; export { helper as save } from './helper';",
      "app/erased.ts": "'use server'; export async function save(): Promise<unknown> { return {}; }",
    }));
    expect(report.findings.filter(item => item.rule === "E1").map(item => item.file).sort()).toEqual([
      "app/alias.ts", "app/inline.ts", "app/nested.ts", "app/reexport.ts",
    ]);
    expect(report.leads).toContainEqual(expect.objectContaining({ rule: "E2", file: "app/erased.ts", message: expect.stringContaining("any/unknown") }));
  });

  it("provides a reusable-component catalog and contextual leads without automatic DRY verdicts", async () => {
    const shape = "<section><div><h2>Title</h2><p>Text</p></div><div><span>A</span><span>B</span><span>C</span></div></section>";
    const report = await check(await fixture({
      "components/forms/button.tsx": "export const Button = () => <button>Save</button>;",
      "components/forms/index.ts": "export { Button } from './button';",
      "app/one.tsx": `export const One = () => ${shape};`,
      "app/two.tsx": `export const Two = () => ${shape};`,
      "app/controls.tsx": "export const Controls = () => <div><button>Save</button><input type='hidden' /></div>;",
      "app/fallback.ts": "export function read() { try { return 1; } catch { return 0; } }",
      "app/computed.ts": "export const load = (name: string) => import(name);",
    }));
    expect(report.findings).toEqual([]);
    expect(report.catalog).toContainEqual({ name: "Button", importFrom: "@/components/forms", declaration: "components/forms/button.tsx" });
    expect(report.leads).toContainEqual(expect.objectContaining({ rule: "C1", file: "app/controls.tsx", candidate: "Button" }));
    expect(report.leads).toContainEqual(expect.objectContaining({ rule: "C1", related: expect.objectContaining({ file: "app/two.tsx" }) }));
    expect(report.leads).toContainEqual(expect.objectContaining({ rule: "E2", file: "app/fallback.ts" }));
    expect(report.leads).toContainEqual(expect.objectContaining({ rule: "C2", file: "app/computed.ts" }));
    expect(report.status).toBe("review_pending");
  });
});

describe("honest coverage and registry", () => {
  it("refuses an empty inventory, invalid compiler configuration, and unreadable source links", async () => {
    const root = await fixture();
    await rm(path.join(root, "lib"), { recursive: true });
    await expect(inventory(root)).rejects.toThrow("No production sources");
    await put(root, { "app/page.ts": "export const page = 1;", "tsconfig.json": "{" });
    await expect(checkArchitecture({ root, all: true })).rejects.toThrow();
    await symlink(path.join(root, "missing.ts"), path.join(root, "app/link.ts"));
    await expect(inventory(root)).rejects.toThrow("Source symlinks");
  });

  it("does not turn a type error into successful architecture verification", async () => {
    const report = await checkArchitecture({ root: await fixture({ "app/bad.ts": "export const value: number = 'wrong';" }), all: true });
    expect(report.status).toBe("incomplete");
    expect(report.diagnostics).toContainEqual(expect.objectContaining({ file: "app/bad.ts", code: 2322 }));
    expect(report.checks.every(item => item.status === "not_checked")).toBe(true);
    expect(exitCode(report)).toBe(2);
  });

  it("rejects registry drift, silent disables, and unexplained exceptions", () => {
    expect(() => validateRules([...RULES, { ...RULES[0], id: "S99" }], POLICY, mechanical)).toThrow("No detector implements S99");
    expect(() => validateRules(RULES.slice(1), POLICY, mechanical)).toThrow("Detector S1 has no rule");
    expect(() => validateRules([...RULES, RULES[0]], POLICY, mechanical)).toThrow("Duplicate rule");
    expect(() => validateRules([{ ...RULES[0], disabledReason: false }, ...RULES.slice(1)], POLICY, mechanical)).toThrow("reason to be disabled");
    expect(() => validateRules([{ ...RULES[0], detect: "" }, ...RULES.slice(1)], POLICY, mechanical)).toThrow("needs detect");
    expect(() => validateRules(RULES, { ...POLICY, exceptions: [{ ...POLICY.exceptions[0], reason: "" }] }, mechanical)).toThrow("Exceptions need");
    expect(() => validateRules(RULES, { ...POLICY, libraryOwners: [{ ...POLICY.libraryOwners[0], reason: "" }] }, mechanical)).toThrow("Library owners need");
  });

  it("reports explicitly disabled rules and unused exceptions as unchecked", async () => {
    const report = await checkArchitecture({ root: await fixture(), all: true, rules: [{ ...RULES[0], disabledReason: "Fixture exercises a declared opt-out." }, ...RULES.slice(1)] });
    expect(report.checks[0]).toMatchObject({ id: "S1", status: "not_checked", files: 0, reason: expect.stringContaining("opt-out") });
    expect(report.exceptions.unused).toEqual(POLICY.exceptions);
  });
});

describe("scope and command contract", () => {
  it("includes staged, unstaged, and untracked files and distinguishes a clean diff", async () => {
    const root = await fixture({ "app/staged.ts": "export const value = 1;", "app/unstaged.ts": "export const value = 1;" });
    startGit(root);
    const clean = await check(root, false);
    expect(clean.status).toBe("no_changes");
    expect(clean.scope.inspected).toBe(0);
    expect(clean.checks.every(item => item.status === "not_checked")).toBe(true);
    await put(root, { "app/staged.ts": "export const value = 2;" });
    git(root, "add", "app/staged.ts");
    await put(root, { "app/unstaged.ts": "export const value = 2;", "app/untracked.ts": "export const value = 3;" });
    // A staged change is still in scope when the working copy was restored.
    await put(root, { "app/staged.ts": "export const value = 1;" });
    const report = await check(root, false);
    expect(report.scope.files).toEqual(["app/staged.ts", "app/unstaged.ts", "app/untracked.ts"]);
    expect(report.scope.expandedToAll).toBe(false);
    expect(report.scope.content).toBe("working_tree");
  });

  it("uses the merge base for committed branch changes and scopes a nested project correctly", async () => {
    const parent = await fixture();
    const root = path.join(parent, "nested");
    await put(root, support);
    startGit(parent);
    git(parent, "branch", "baseline");
    await put(root, { "app/committed.ts": "export const value = 1;" });
    commit(parent);
    await put(root, { "app/new.ts": "export const value = 2;" });
    await put(parent, { "app/outside.ts": "export const value = 3;" });
    expect(changedFiles(root, "baseline")).toEqual(["app/committed.ts", "app/new.ts"]);
    const report = await checkArchitecture({ root, base: "baseline" });
    expect(report.scope.files).toEqual(["app/committed.ts", "app/new.ts"]);
  });

  it("checks affected callers through barrels when a helper's inferred return changes", async () => {
    const root = await fixture({
      "app/helper.ts": "export async function helper() { return 1; }",
      "app/barrel.ts": "export { helper } from './helper';",
      "app/action.ts": "'use server'; import { helper } from './barrel'; export const save = helper;",
    });
    startGit(root);
    await put(root, { "app/helper.ts": "import { ok } from '../lib/kernel/result'; export async function helper() { return ok(1); }" });
    const report = await check(root, false);
    expect(report.scope.affected).toEqual(["app/action.ts", "app/barrel.ts"]);
    expect(report.findings).toContainEqual(expect.objectContaining({ rule: "E1", file: "app/action.ts" }));
    expect(report.scope.context).toContain("lib/kernel/result.ts");
  });

  it("expands policy changes and deletions to all sources; CSS-only changes still require review", async () => {
    const root = await fixture();
    startGit(root);
    await put(root, { "styles/example.css": "button { color: red; }" });
    const styles = await check(root, false);
    expect(styles.scope.inspected).toBe(0);
    expect(styles.scope.reviewFiles).toEqual(["styles/example.css"]);
    expect(styles.status).toBe("review_pending");
    await put(root, { "tools/architecture/REVIEW.md": "Changed policy" });
    const policy = await check(root, false);
    expect(policy.scope.expandedToAll).toBe(true);
    expect(policy.scope.inspected).toBe(policy.scope.inventory);
    commit(root);
    await rm(path.join(root, "lib/services/example.ts"));
    const deletion = await check(root, false);
    expect(deletion.scope.deleted).toEqual(["lib/services/example.ts"]);
    expect(deletion.scope.expandedToAll).toBe(true);
  });

  it("rejects portable relative imports that reach outside a standalone project", async () => {
    const parent = await fixture();
    const root = path.join(parent, "nested");
    await put(root, { ...support, "lib/kernel/outside.ts": "export { unit } from '../../../lib/kernel/unit';" });
    const report = await check(root);
    expect(report.findings).toContainEqual(expect.objectContaining({ rule: "S2", file: "lib/kernel/outside.ts" }));
  });

  it("inventories supported source extensions while excluding tests, declarations, and build output", async () => {
    const root = await fixture(Object.fromEntries([
      "app/file.js", "app/file.jsx", "app/file.mjs", "app/file.mts", "app/file.cjs", "app/file.cts", "proxy.ts",
      "app/skip.test.ts", "app/skip.spec.tsx", "app/skip.d.ts", "app/build/file.ts", "app/node_modules/file.ts",
    ].map(name => [name, "export const value = 1;"])));
    const files = (await inventory(root)).map(name => path.relative(root, name));
    for (const name of ["app/file.js", "app/file.jsx", "app/file.mjs", "app/file.mts", "app/file.cjs", "app/file.cts", "proxy.ts"]) expect(files).toContain(name);
    expect(files.some(name => /skip|build|node_modules/.test(name))).toBe(false);
  });

  it("emits parseable JSON, returns distinct failure codes, and does not write into the project", async () => {
    const root = await fixture();
    async function snapshot(directory: string): Promise<Record<string, string>> {
      const result: Record<string, string> = {};
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const full = path.join(directory, entry.name);
        if (entry.isDirectory()) Object.assign(result, await snapshot(full));
        else result[path.relative(root, full)] = await readFile(full, "utf8");
      }
      return result;
    }
    const before = await snapshot(root);
    const run = (...args: string[]) => spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: "utf8" });
    const good = run("--all", "--json");
    expect(good.status).toBe(0);
    expect(JSON.parse(good.stdout).status).toBe("review_pending");
    expect(await snapshot(root)).toEqual(before);
    for (const args of [["--no-such-flag", "--json"], ["--all", "--changed", "--json"], ["--base", "--json"], ["--changed", "--json"]]) {
      const bad = run(...args);
      expect(bad.status).toBe(2);
      expect(JSON.parse(bad.stdout).status).toBe("incomplete");
    }
    await put(root, { "app/violation.ts": "export { Icon } from 'lucide-react';" });
    const violation = run("--all", "--json");
    expect(violation.status).toBe(1);
    expect(JSON.parse(violation.stdout).findings).toContainEqual(expect.objectContaining({ rule: "S3" }));
  }, 20_000);

  it("reports absent bundle evidence as a skipped test in an actual Vitest run", async () => {
    const project = fileURLToPath(new URL("../../", import.meta.url));
    const root = await fixture({
      "bundle.test.ts": await readFile(path.join(project, "lib/kernel/bundle.test.ts"), "utf8"),
      "lib/services/ledger/ledger.fixtures.ts": await readFile(path.join(project, "lib/services/ledger/ledger.fixtures.ts"), "utf8"),
      "lib/services/session/session.fixtures.ts": await readFile(path.join(project, "lib/services/session/session.fixtures.ts"), "utf8"),
      "vitest.config.mjs": "export default { test: { environment: 'node', include: ['bundle.test.ts'] } };",
    });
    await symlink(path.join(project, "node_modules"), path.join(root, "node_modules"), "dir");
    const run = spawnSync(process.execPath, [
      path.join(project, "node_modules/vitest/vitest.mjs"), "run", "--root", root,
      "--config", path.join(root, "vitest.config.mjs"), "--reporter", "json", "--outputFile", path.join(root, "report.json"),
    ], { cwd: root, encoding: "utf8" });
    expect(run.status, run.stderr || run.stdout).toBe(0);
    const report = JSON.parse(await readFile(path.join(root, "report.json"), "utf8"));
    expect(report.numPassedTests).toBe(1);
    expect(report.numPendingTests).toBe(1);
    expect(report.testResults[0].assertionResults).toContainEqual(expect.objectContaining({
      title: "no client chunk contains a string only a fixture has", status: "skipped",
    }));
  }, 20_000);
});
