import type { ReactNode } from "react";
import { cn } from "@/lib/kernel";
import { badgeVariants, type BadgeVariants } from "./badge.variants";
import s from "./badge.module.css";

export type BadgeProps = BadgeVariants & {
  /** A mark carried BESIDE the colour. Hidden from readers — the text is the
   *  announcement — and present so the badge survives being seen in greyscale
   *  or by somebody who cannot distinguish the hues. */
  glyph?: string;
  className?: string;
  children: ReactNode;
};

export function Badge({ tone, glyph, className, children }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)}>
      {glyph ? <span className={s.glyph} aria-hidden="true">{glyph}</span> : null}
      {children}
    </span>
  );
}
