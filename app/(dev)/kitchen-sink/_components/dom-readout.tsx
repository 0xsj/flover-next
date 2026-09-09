"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import s from "./sink.module.css";

/* Three of the four utility components do their work in the accessibility tree,
 * where there is nothing for a gallery to show.
 *
 * So show the DOM they produce, read back from the live element rather than
 * transcribed beside it — the same argument the palette makes about computed
 * token values. A transcribed snippet is a second copy that goes stale silently,
 * and here it would be a claim about hiding that nothing checked. */
export function DomReadout({ note, children }: { note?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [markup, setMarkup] = useState("");
  const [text, setText] = useState("");

  /* Empty deps deliberately: these demos are static, and `children` is a fresh
     value on every render, so depending on it would re-run this every time. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setMarkup(el.innerHTML.replace(/></g, ">\n<"));
    setText((el.textContent ?? "").replace(/\s+/g, " ").trim());
  }, []);

  return (
    <div className={s.readout}>
      <div ref={ref} className={s.readoutStage}>{children}</div>
      <div className={s.readoutRow}>
        <span className={s.rowLabel}>reads as</span>
        <span className={s.readoutText}>{markup ? `“${text}”` : "…"}</span>
      </div>
      {note ? <p className={s.limits}>{note}</p> : null}
      <pre className={s.codeBlock}><code>{markup || "…"}</code></pre>
    </div>
  );
}
