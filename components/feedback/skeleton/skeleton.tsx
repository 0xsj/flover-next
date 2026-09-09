import type { CSSProperties } from "react";
import { cn } from "@/lib/kernel";
import s from "./skeleton.module.css";

export type SkeletonProps = {
  /** Any CSS length. Defaults to filling the container, which is usually right:
   *  a skeleton should be the size of the thing that is coming, and the
   *  container already knows that. */
  width?: string;
  height?: string;
  circle?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** A placeholder for content that has not arrived.
 *
 *  ALWAYS hidden from assistive technology. It carries no information — a
 *  reader hearing "loading" ten times from ten skeletons is worse off than one
 *  hearing nothing. The BUSY state belongs on the region, as `aria-busy`, which
 *  is one announcement instead of ten. */
export function Skeleton({ width, height, circle, className, style }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(s.skeleton, circle && s.circle, className)}
      style={{ inlineSize: width, blockSize: height, ...style }}
    />
  );
}

export type SkeletonTextProps = { lines?: number; className?: string };

/** Text-shaped placeholder. The last line is short, because real paragraphs end
 *  mid-line and a block of equal bars reads as a table. */
export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <span aria-hidden="true" className={cn(s.text, className)}>
      {Array.from({ length: lines }, (_, i) => (
        <span
          key={i}
          className={s.skeleton}
          style={{ inlineSize: i === lines - 1 ? "62%" : "100%" }}
        />
      ))}
    </span>
  );
}
