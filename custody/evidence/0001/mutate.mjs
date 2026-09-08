#!/usr/bin/env node
/* Mutation harness. The guards are the point, not the mutations.
 *
 *   · restore in a `finally`, ALWAYS
 *   · restore only the file being mutated, from content read AT MUTATION TIME
 *   · typecheck FIRST — a mutation that does not compile is INVALID, not killed.
 *     That is the failure direction that flatters you.
 *   · use vitest's own --testTimeout, never a `timeout` wrapper (not on macOS,
 *     and "command not found" scores a perfect run out of a harness that ran
 *     nothing)
 *   · negative controls: one mutation that MUST die, one that MUST survive
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();
const SUITE = process.argv[2];
if (!SUITE) { console.error("usage: node mutate.mjs <suite-path>"); process.exit(2); }

const M = [
  // ── the three previously-fixed faults ────────────────────────────────────
  { id: "M1", label: "a time budget elapsing is classified as a cancellation",
    file: "lib/http/envelope.ts",
    from: `if (name === "TimeoutError") return timeout("The server took too long to respond.");`,
    to:   `if (name === "TimeoutError") return canceled("The server took too long to respond.");` },

  { id: "M2", label: "an unrecognised not_found is reported as emptiness",
    file: "lib/kernel/optional.ts",
    from: `  if (absent(f)) return new Ok(null);`,
    to:   `  if (absent(f) || true) return new Ok(null);` },

  { id: "M3", label: "narrow folds a transport failure instead of passing it through",
    file: "lib/kernel/failure.ts",
    from: `    if (isTransport(f)) return f;`,
    to:   `    if (isTransport(f)) return because(internal(f.message, { type: f.type, requestId: f.requestId, status: f.status }), f) as TransportFailure;` },

  // ── conventional ─────────────────────────────────────────────────────────
  { id: "M4", label: "drop one member from the retryable set",
    file: "lib/kernel/failure.ts",
    from: `  return f.kind === "rate_limited" || f.kind === "unavailable" || f.kind === "timeout";`,
    to:   `  return f.kind === "rate_limited" || f.kind === "unavailable";` },

  { id: "M5", label: "move the backoff cap",
    file: "lib/kernel/failure.ts",
    from: `  return Math.min(2 ** attempt * 250, 8_000);`,
    to:   `  return Math.min(2 ** attempt * 250, 80_000);` },

  { id: "M6", label: "retryAfter read as milliseconds rather than seconds",
    file: "lib/kernel/failure.ts",
    from: `  if (f.kind === "rate_limited" && f.retryAfter !== undefined) return f.retryAfter * 1000;`,
    to:   `  if (f.kind === "rate_limited" && f.retryAfter !== undefined) return f.retryAfter;` },

  { id: "M7", label: "an unserved fixture route answers not_found",
    file: "lib/http/memory-client.ts",
    from: `    return err(internal(\`No fixture route for \${method} \${path}\`, { type: UNSERVED_ROUTE, correlationId }));`,
    to:   `    return err({ kind: "not_found", message: \`No fixture route for \${method} \${path}\`, type: UNSERVED_ROUTE, correlationId });` },

  { id: "M8", label: "isFailure stops checking that message is a string",
    file: "lib/kernel/failure.ts",
    from: `    isFailureKind((v as { kind?: unknown }).kind) &&\n    typeof (v as { message?: unknown }).message === "string"`,
    to:   `    isFailureKind((v as { kind?: unknown }).kind)` },

  { id: "M9", label: "412 decodes as invalid rather than conflict",
    file: "lib/http/envelope.ts",
    from: `    case 412: return "conflict";`,
    to:   `    case 412: return "invalid";` },

  { id: "M10", label: "a non-JSON body on a 2xx is reported as a transport fault",
    file: "lib/http/fetch-client.ts",
    from: `      return err(internal("The server's response could not be read.", { status: response.status }));`,
    to:   `      return err({ kind: "unavailable", message: "The server's response could not be read.", status: response.status });` },

  // ── negative controls ────────────────────────────────────────────────────
  { id: "NC-die", control: "must-die", label: "ok() constructs a failure",
    file: "lib/kernel/result.ts",
    from: `export const ok = <T, E = Failure>(value: T): Ok<T, E> => new Ok(value);`,
    to:   `export const ok = <T, E = Failure>(value: T): Ok<T, E> => new Ok(undefined as T);` },

  { id: "NC-live", control: "must-survive", label: "a comment is reworded (equivalent mutant)",
    file: "lib/kernel/failure.ts",
    from: `/** The sealed-trait guarantee.`,
    to:   `/** The sealed trait guarantee.` },
];

const run = (cmd, args) => {
  try { execFileSync(cmd, args, { cwd: ROOT, stdio: "pipe" }); return true; }
  catch { return false; }
};

let killed = 0, survived = 0, invalid = 0;
const rows = [];

for (const m of M) {
  const abs = path.join(ROOT, m.file);
  const original = readFileSync(abs, "utf8");     // read AT mutation time
  let verdict;
  try {
    if (!original.includes(m.from)) { verdict = "NOT-APPLIED"; }
    else {
      writeFileSync(abs, original.replace(m.from, m.to));
      // Typecheck first. A mutation that does not compile is INVALID.
      if (!run("npx", ["tsc", "--noEmit"])) verdict = "INVALID (does not compile)";
      else verdict = run("npx", ["vitest", "run", SUITE, "--testTimeout=10000", "--reporter=dot"])
        ? "SURVIVED" : "killed";
    }
  } finally {
    writeFileSync(abs, original);                 // only this file, this content
  }
  rows.push({ ...m, verdict });
  if (verdict === "killed") killed++;
  else if (verdict === "SURVIVED") survived++;
  else invalid++;
  console.log(`  ${verdict.padEnd(26)} ${m.id.padEnd(8)} ${m.label}`);
}

const nc = Object.fromEntries(rows.filter(r => r.control).map(r => [r.control, r.verdict]));
console.log(`\ncontrols: must-die=${nc["must-die"]}  must-survive=${nc["must-survive"]}`);
const controlsOk = nc["must-die"] === "killed" && nc["must-survive"] === "SURVIVED";
console.log(controlsOk ? "controls PASS — the harness is measuring something"
                       : "CONTROLS FAILED — do not trust the ratio below");

const scored = rows.filter(r => !r.control);
const k = scored.filter(r => r.verdict === "killed").length;
console.log(`\n${k}/${scored.length} killed · ${scored.filter(r=>r.verdict==="SURVIVED").length} survived · ${scored.filter(r=>!["killed","SURVIVED"].includes(r.verdict)).length} invalid`);
