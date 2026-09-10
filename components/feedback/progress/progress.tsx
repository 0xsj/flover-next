import type { ProgressHTMLAttributes } from "react";
import { cn } from "@/lib/kernel";
import s from "./progress.module.css";

export type ProgressProps = Omit<ProgressHTMLAttributes<HTMLProgressElement>, "value" | "max" | "children"> & {
  label: string;
  value: number | null;
  max?: number;
};
export function Progress({ label, value, max = 100, className, ...props }: ProgressProps) {
  const limit = Number.isFinite(max) && max > 0 ? max : 100;
  const amount = value === null || !Number.isFinite(value) ? undefined : Math.max(0, Math.min(value, limit));
  return <progress className={cn(s.progress, className)} aria-label={label} max={limit} value={amount} {...props} />;
}
