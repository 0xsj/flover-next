#!/usr/bin/env node
// ADR immutability.
//
// Two rules make this different from a checksum:
//   1. verify NEVER writes. Sealing is a separate, deliberate act. A checker that
//      re-baselines on the run that fails turns a violation into a one-shot signal
//      that erases itself.
//   2. The status line is the ONLY line that may ever change. Everything else is
//      hashed as `body` and must match forever — so `--supersede` cannot be used
//      to launder an edit.
//
//   node decisions/verify.mjs                        read-only. exit 1 on any problem
//   node decisions/verify.mjs --seal 0001            seal an Accepted record
//   node decisions/verify.mjs --supersede 0001 --by 0002
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const STORE = join(HERE, "sealed.json");
const GENESIS = "0".repeat(64);
const STATUS_LINE = /^\*\*Status:\*\*.*$/m;

const sha = (s) => createHash("sha256").update(s).digest("hex");
const files = () => readdirSync(HERE).filter((f) => /^\d{4}-.+\.md$/.test(f)).sort();
const find = (pre) => files().find((f) => f.startsWith(pre.replace(/\.md$/, "")));
const read = (f) => readFileSync(join(HERE, f), "utf8");
const hashes = (f) => { const s = read(f); return { file: sha(s), body: sha(s.replace(STATUS_LINE, "")) }; };
const statusOf = (f) => (read(f).match(/\*\*Status:\*\*\s*(\w+)/) || [])[1];

const load = () => existsSync(STORE) ? JSON.parse(readFileSync(STORE, "utf8"))
  : { "//": "Append-only. `prev` chains each seal to the one before, so removing a record breaks the chain. `body` must never change; only the status line may.", records: [] };
const save = (d) => writeFileSync(STORE, JSON.stringify(d, null, 2) + "\n");
// The link hashes only what is IMMUTABLE about a record: which record it is,
// what it says, when it was sealed, and what it followed. `status`, `file` and
// `history` are excluded because --supersede is designed to change all three —
// including them meant superseding any record broke the chain for every record
// sealed after it, which made the tool's own supported operation unusable.
// The mutable fields are still verified, directly and per record: `body` must
// never move, and `file` moving without --supersede is STATUS MOVED.
const linkHash = (e) => sha(JSON.stringify([e.slug, e.body, e.sealed_at, e.prev]));

function verify() {
  const db = load(), onDisk = new Set(files().map((f) => f.replace(/\.md$/, "")));
  let bad = 0, ok = 0, expect = GENESIS;

  for (const e of db.records) {
    const f = `${e.slug}.md`;
    if (e.prev !== expect) { console.log(`  CHAIN BROKEN  ${e.slug} — a sealed record was removed or reordered`); bad++; }
    expect = linkHash(e);
    if (!existsSync(join(HERE, f))) { console.log(`  DELETED       ${e.slug} — sealed but no longer on disk`); bad++; continue; }
    onDisk.delete(e.slug);
    const h = hashes(f);
    if (h.body !== e.body) { console.log(`  TAMPERED      ${e.slug} — body changed. An accepted record is superseded, never edited`); bad++; }
    else if (h.file !== e.file) { console.log(`  STATUS MOVED  ${e.slug} — status line changed without --supersede`); bad++; }
    else ok++;
  }
  for (const slug of onDisk) {
    const st = statusOf(`${slug}.md`);
    if (st === "Accepted") { console.log(`  UNSEALED      ${slug} — Accepted and not sealed. Run --seal ${slug}`); bad++; }
    else console.log(`  unsealed      ${slug} — ${st ?? "no status"}, not yet immutable`);
  }
  console.log(`\n${ok} sealed and intact · ${bad} problem${bad === 1 ? "" : "s"}`);
  return bad ? 1 : 0;
}

function seal(pre) {
  const f = find(pre); if (!f) { console.error(`no record matching ${pre}`); return 1; }
  const slug = f.replace(/\.md$/, ""), db = load();
  if (db.records.some((r) => r.slug === slug)) { console.error(`${slug} is already sealed`); return 1; }
  if (statusOf(f) !== "Accepted") { console.error(`${slug} is ${statusOf(f)} — only an Accepted record is sealed`); return 1; }
  const last = db.records[db.records.length - 1];
  const h = hashes(f);
  db.records.push({ slug, status: "Accepted", file: h.file, body: h.body,
                    sealed_at: new Date().toISOString(), prev: last ? linkHash(last) : GENESIS, history: [] });
  save(db); console.log(`sealed ${slug}\n  body ${h.body.slice(0, 16)}…  — this may never change again`);
  return 0;
}

function supersede(pre, byPre) {
  const f = find(pre), by = find(byPre);
  if (!f) { console.error(`no record matching ${pre}`); return 1; }
  if (!by) { console.error(`no record matching ${byPre} to supersede it`); return 1; }
  const slug = f.replace(/\.md$/, ""), db = load();
  const e = db.records.find((r) => r.slug === slug);
  if (!e) { console.error(`${slug} was never sealed`); return 1; }
  if (statusOf(f) !== "Superseded") { console.error(`${slug} still reads Status: ${statusOf(f)} — edit the status line first`); return 1; }
  const h = hashes(f);
  if (h.body !== e.body) { console.error(`${slug} body changed. Supersede moves the status line ONLY; the record itself is immutable`); return 1; }
  e.history.push({ from: e.file, to: h.file, at: new Date().toISOString(), by: by.replace(/\.md$/, "") });
  e.status = "Superseded"; e.file = h.file;
  save(db); console.log(`${slug} superseded by ${by.replace(/\.md$/, "")}`);
  return 0;
}

const a = process.argv.slice(2);
const at = (k) => { const i = a.indexOf(k); return i < 0 ? null : a[i + 1]; };
process.exit(a.includes("--seal") ? seal(at("--seal"))
  : a.includes("--supersede") ? supersede(at("--supersede"), at("--by"))
  : verify());
