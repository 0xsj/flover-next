import type { HTMLAttributes } from "react";
import { cn } from "@/lib/kernel";
import { textVariants, type TextVariants } from "./text.variants";

export type TextProps = HTMLAttributes<HTMLElement> & TextVariants & { as?: "p" | "span" | "div" };
export function Text({ as: Tag = "p", size, tone, weight, measure, truncate, className, ...props }: TextProps) {
  return <Tag className={cn(textVariants({ size, tone, weight, measure, truncate }), className)} {...props} />;
}
