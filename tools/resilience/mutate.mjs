import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const evidence = mkdtempSync(join(tmpdir(), "flover-resilience-mutations-"));
const workspace = join(evidence, "workspace");
const excluded = new Set([".git", "node_modules", ".next", ".agents", ".codex"]);
cpSync(root, workspace, { recursive: true, filter: path => !relative(root, path).split(/[\\/]/).some(part => excluded.has(part)) });
symlinkSync(join(root, "node_modules"), join(workspace, "node_modules"), "dir");
// Next's generated type imports are needed by tsc, but no build output is mutated.
for (const part of [".next/types", ".next/dev/types"]) {
  if (existsSync(join(root, part))) {
    mkdirSync(dirname(join(workspace, part)), { recursive: true });
    cpSync(join(root, part), join(workspace, part), { recursive: true });
  }
}

const tests = [
  "lib/http/response.test.ts", "lib/services/responses.test.ts", "lib/chaos/sequence.test.ts",
  "lib/runtime/latest-read.test.ts", "app/(workspace)/cookbook/(recipes)/resilience/note-model.test.ts",
];
const note = "app/(workspace)/cookbook/(recipes)/resilience/note-model.ts";
const mutations = [
  { id: "bypass-decoding", file: "lib/http/response.ts", from: "const decoded = read(value);", to: "const decoded = value as T;" },
  { id: "validate-only-first-item", file: "lib/http/response.ts", from: "for (const raw of value)", to: "for (const raw of value.slice(0, 1))" },
  { id: "accept-obsolete-responses", file: "lib/runtime/latest-read.ts", from: "if (own !== generation || signal.aborted) return;", to: "// Obsolete responses are deliberately accepted." },
  { id: "erase-last-good-data", file: "lib/runtime/latest-read.ts", from: 'settled = { state: "failed", failure: result.error, previous };', to: 'settled = { state: "failed", failure: result.error, previous: undefined };' },
  { id: "lose-response-before-commit", file: "lib/chaos/sequence.ts", from: "const result = await inner.request<T>(method, path, { ...options, signal });", to: 'const result = effect?.kind === "lose-response" ? ok(undefined as T) : await inner.request<T>(method, path, { ...options, signal });' },
  { id: "allow-unresolved-second-write", file: note, from: '["saving", "checking", "unknown"]', to: '["saving", "checking"]' },
  { id: "overwrite-newer-draft", file: note, from: 'store.set({ ...store.get(), confirmed: receipt, phase: { state: "ready" } });', to: 'store.set({ ...store.get(), draft: receipt.draft, confirmed: receipt, phase: { state: "ready" } });' },
  { id: "treat-failed-check-as-absence", file: note, from: "if (!result.ok) uncertain(attempt, result.error);", to: 'if (!result.ok) updatePhase({ state: "not-recorded" });' },
];
const hash = value => createHash("sha256").update(value).digest("hex");
const subjects = [...new Set([...tests, ...mutations.map(mutation => mutation.file)])];
const report = {
  provenance: "Implementation-visible ordinary tests; curated mutations, not a blind spec-test run.",
  isolation: "A temporary source copy; the working tree is never mutated.",
  hashes: Object.fromEntries(subjects.map(file => [file, hash(readFileSync(join(workspace, file)))])),
  controls: [], mutations: [],
};

function run(id) {
  const compile = spawnSync(process.execPath, [join(root, "node_modules/typescript/bin/tsc"), "--noEmit", "--incremental", "false"], { cwd: workspace, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (compile.error || compile.signal || compile.status === null) throw new Error(`Compiler did not complete: ${compile.error ?? compile.signal}`);
  writeFileSync(join(evidence, `${id}.typecheck.log`), compile.stdout + compile.stderr);
  if (compile.status !== 0) return { id, outcome: "invalid", failedTests: 0 };
  const output = join(evidence, `${id}.tests.json`);
  const tested = spawnSync(process.execPath, [join(root, "node_modules/vitest/vitest.mjs"), "run", ...tests, "--reporter=json", `--outputFile=${output}`], { cwd: workspace, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  writeFileSync(join(evidence, `${id}.runner.log`), tested.stdout + tested.stderr);
  if (tested.error || tested.signal || !existsSync(output)) throw new Error(`Test runner did not complete: ${tested.error ?? tested.signal ?? tested.stderr}`);
  const result = JSON.parse(readFileSync(output, "utf8"));
  if (!result.numTotalTests || result.numRuntimeErrorTestSuites || (tested.status !== 0 && !result.numFailedTests)) throw new Error(`No assertion-based result for ${id}; inspect ${output}`);
  return { id, outcome: result.numFailedTests > 0 ? "killed" : "survived", failedTests: result.numFailedTests, totalTests: result.numTotalTests };
}

function measure(mutation) {
  const path = join(workspace, mutation.file);
  const original = readFileSync(path, "utf8");
  if (original.split(mutation.from).length !== 2) throw new Error(`Mutation ${mutation.id} must match exactly once in ${basename(path)}`);
  try {
    writeFileSync(path, original.replace(mutation.from, mutation.to));
    return run(mutation.id);
  } finally { writeFileSync(path, original); }
}

try {
  const baseline = run("baseline");
  if (baseline.outcome !== "survived") throw new Error("Baseline must typecheck and pass before mutation scoring.");
  report.controls.push(baseline);
  console.log(`Baseline: ${baseline.totalTests} tests pass.`);
  for (const mutation of [
    { id: "control-no-behavior-change", file: "lib/http/response.ts", from: "const decoded = read(value);", to: "const decoded = read(value); // Equivalent control." },
    { id: "control-type-error", file: "lib/http/response.ts", from: "const decoded = read(value);", to: "const decoded: never = read(value);" },
  ]) report.controls.push(measure(mutation));
  if (report.controls[1].outcome !== "survived" || report.controls[2].outcome !== "invalid") throw new Error("Negative controls were misclassified; do not trust a mutation score.");
  for (const mutation of mutations) {
    const result = measure(mutation);
    report.mutations.push(result);
    console.log(`${result.id}: ${result.outcome} (${result.failedTests} failed tests)`);
  }
  const killed = report.mutations.filter(result => result.outcome === "killed").length;
  report.summary = `${killed}/${mutations.length} curated mutants killed; equivalent and compile-error controls classified correctly.`;
  console.log(report.summary);
  if (killed !== mutations.length) process.exitCode = 1;
} catch (error) {
  report.error = String(error);
  console.error(error);
  process.exitCode = 1;
} finally {
  writeFileSync(join(evidence, "report.json"), JSON.stringify(report, null, 2));
  console.log(`Evidence: ${join(evidence, "report.json")}`);
}
