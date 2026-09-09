"use client";

import { RadioGroup as Primitive } from "radix-ui";
import { cn } from "@/lib/kernel";
import s from "./segmented.module.css";

export type SegmentedOption<T extends string> = { value: T; label: string };

export type SegmentedProps<T extends string> = {
  /** REQUIRED. A group of options is announced by its own name before every
   *  option in it, and a settings control with no name is "radio group". */
  label: string;
  value: T;
  onChange: (next: T) => void;
  options: readonly SegmentedOption<T>[];
  className?: string;
};

/* Shared by both toggles, and not exported from the group.
 *
 * A group-level internal rather than a component directory: it has two callers,
 * both here, and promoting it is a move rather than a rewrite if a screen ever
 * needs one for content. `components/overlays/overlay.module.css` is the same
 * arrangement one file down.
 *
 * # It is a RADIO GROUP, not a row of toggle buttons
 *
 * The control it replaced was three buttons carrying `aria-pressed`, which
 * announces three independent on/off states — when the truth is one choice with
 * three answers, exactly one of which is true. The difference is not cosmetic:
 * a reader is told how many decisions are in front of them.
 *
 *     radiogroup      one Tab stop, arrows move between options, one is checked
 *     three buttons   three Tab stops, three separate "pressed" states
 *
 * # Arrowing moves focus; Space commits
 *
 * Measured, and NOT what the primitive intends — it means to check on arrow,
 * through a document-level listener that runs after the roving focus has moved,
 * so the focus arrives unchecked. Whether a browser orders those two the same
 * way as the test environment is not established here.
 *
 * The design has to survive both, and does: a focused-but-unchecked option
 * needs a focus ring distinct from the checked fill, and the reset's
 * `:focus-visible` outline is exactly that against a filled background. Do not
 * remove the outline from these items to tidy the lockup.
 *
 * The counter-argument to the whole shape exists: a segmented control is often
 * built with `aria-pressed` and toolbar semantics. Recorded so the choice is
 * visible as a choice. */
export function Segmented<T extends string>({
  label, value, onChange, options, className,
}: SegmentedProps<T>) {
  return (
    <Primitive.Root
      className={cn(s.group, className)}
      aria-label={label}
      value={value}
      onValueChange={(next) => onChange(next as T)}
      orientation="horizontal"
      loop
    >
      {options.map((option) => (
        <Primitive.Item key={option.value} value={option.value} className={s.item}>
          {option.label}
        </Primitive.Item>
      ))}
    </Primitive.Root>
  );
}
