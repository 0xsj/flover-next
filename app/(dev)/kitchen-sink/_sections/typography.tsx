"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/kernel";
import { Case, Row, Section } from "../_components/section";
import s from "../_components/sink.module.css";

/* Whether a font is "working" is two questions and this section answers both.
 *
 * `--font-sans` resolving proves the token contract held — that `next/font`
 * emitted the variable name `typography.css` expects. It does NOT prove the
 * family loaded: a webfont that 404s falls through to `ui-sans-serif` and the
 * page still looks deliberate. `document.fonts.check` is the second question,
 * and FALLBACK below means the first passed and the second did not. */

const SIZES = [
  "--text-9", "--text-10", "--text-11", "--text-11-5", "--text-12",
  "--text-12-5", "--text-13", "--text-15", "--text-18", "--text-22",
  "--text-30", "--text-42", "--text-54",
];

const WEIGHTS = [
  ["--weight-regular", 400], ["--weight-medium", 450],
  ["--weight-strong", 500], ["--weight-bold", 600],
] as const;

const LEADING = ["--leading-tight", "--leading-snug", "--leading-body"] as const;
const TRACKING = ["--tracking-tight", "--tracking-label"] as const;

const PANGRAM = "The quick brown fox jumps over the lazy dog";
const PROSE =
  "Nobody looked and looked and found nothing are different facts, and a interface rendering both the same way has thrown away the difference at the moment it had it.";

type Face = { token: string; stack: string; state: "pending" | "loaded" | "fallback" };

function useFaces(): Face[] {
  const [faces, setFaces] = useState<Face[]>([
    { token: "--font-sans", stack: "", state: "pending" },
    { token: "--font-mono", stack: "", state: "pending" },
  ]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const style = getComputedStyle(document.documentElement);
      // `document.fonts.ready` matters: checked too early, a font that is still
      // downloading reports the same false as one that will never arrive.
      await document.fonts.ready;
      if (cancelled) return;

      setFaces(
        (["--font-sans", "--font-mono"] as const).map((token) => {
          const stack = style.getPropertyValue(token).trim();
          const first = (stack.split(",")[0] ?? "").trim().replace(/^["']|["']$/g, "");
          const state = !first
            ? "fallback"
            : document.fonts.check(`13px "${first}"`)
              ? "loaded"
              : "fallback";
          return { token, stack, state };
        }),
      );
    })();

    return () => { cancelled = true; };
  }, []);

  return faces;
}

export function TypographySection() {
  const faces = useFaces();

  return (
    <Section
      id="typography"
      title="Type scale"
      blurb="The family tokens are a contract the font loader satisfies, not a font name — typography.css asks for --font-sans-src and never learns which family answered. Swapping the family is one line in the root layout."
    >
      <Case title="Stacks" note="resolved, then checked against what actually loaded">
        <div className={s.stacks}>
          {faces.map((f) => (
            <div key={f.token} className={s.stack}>
              <div className={s.stackHead}>
                <span className={s.mono}>{f.token}</span>
                <span
                  className={cn(
                    s.verdict,
                    f.state === "loaded" ? s.ok : f.state === "fallback" ? s.fallbackTone : s.pending,
                  )}
                >
                  {f.state === "pending" ? "checking" : f.state}
                </span>
              </div>
              <div className={cn(s.specimen, f.token === "--font-mono" ? s.monoFace : s.sansFace)}>
                {PANGRAM}
              </div>
              <div className={s.stackValue}>{f.stack || "unresolved"}</div>
            </div>
          ))}
        </div>
      </Case>

      <Case title="Sizes" note="thirteen rungs; the small end is where contrast defects cluster">
        <div className={s.sizes}>
          {SIZES.map((t) => (
            <div key={t} className={s.sizeRow}>
              <span className={s.mono}>{t}</span>
              <span className={s.sizeSample} style={{ fontSize: `var(${t})` }}>{PANGRAM}</span>
            </div>
          ))}
        </div>
      </Case>

      <Case title="Weights" note="450 exists because 400 and 500 are too far apart at 13px">
        <div className={s.weights}>
          {WEIGHTS.map(([t, v]) => (
            <div key={t} className={s.weight}>
              <span className={s.weightSample} style={{ fontWeight: `var(${t})` }}>Aa 0123</span>
              <span className={s.mono}>{t} · {v}</span>
            </div>
          ))}
        </div>
      </Case>

      <Case title="Leading and tracking">
        <div className={s.leading}>
          {LEADING.map((t) => (
            <div key={t}>
              <div className={s.mono}>{t}</div>
              <p className={s.leadingSample} style={{ lineHeight: `var(${t})` }}>{PROSE}</p>
            </div>
          ))}
        </div>
        {TRACKING.map((t) => (
          <Row key={t} label={t}>
            <span
              style={{
                letterSpacing: `var(${t})`,
                textTransform: t === "--tracking-label" ? "uppercase" : undefined,
                fontSize: t === "--tracking-label" ? "var(--text-11)" : "var(--text-18)",
                color: "var(--ink)",
              }}
            >
              {t === "--tracking-label" ? "Section label" : "Tightened display line"}
            </span>
          </Row>
        ))}
      </Case>

      <Case title="Mono" note="tabular figures are why the audit table is legible">
        <div className={cn(s.specimen, s.monoFace)}>0123456789</div>
        <pre className={s.codeBlock}>
          <code>{`--font-mono: var(--font-mono-src, ui-monospace),\n             "SF Mono", Menlo, monospace;`}</code>
        </pre>
      </Case>
    </Section>
  );
}
