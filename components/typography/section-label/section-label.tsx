import type { HTMLAttributes } from "react";
import { cn } from "@/lib/kernel";
import s from "./section-label.module.css";

export function SectionLabel({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn(s.label, className)} {...props} />;
}
