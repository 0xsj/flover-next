import type { ReactNode } from "react";
import { cn } from "@/lib/kernel";
import { PRESENCE_MEANING, PRESENCE_WORD } from "../presence";
import s from "./stat.module.css";

export type StatProps = {
  label: string;
  /** `undefined` means NOBODY MEASURED, and it renders as `–` rather than `0`.
   *  A zero is a measurement; an em-dash is the absence of one, and a screen
   *  that shows 0 for an unmeasured total is asserting something nobody checked. */
  value?: number | string;
  hint?: ReactNode;
  className?: string;
};

export function Stat({ label, value, hint, className }: StatProps) {
  const unmeasured = value === undefined;
  return (
    <div className={cn(s.stat, className)}>
      <span className={s.label}>{label}</span>
      <span
        className={cn(s.value, unmeasured && s.unmeasured)}
        title={unmeasured ? PRESENCE_MEANING.unmeasured : undefined}
      >
        {unmeasured ? PRESENCE_WORD.unmeasured : value}
      </span>
      {hint ? <span className={s.hint}>{hint}</span> : null}
    </div>
  );
}
