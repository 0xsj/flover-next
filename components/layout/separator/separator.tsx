import { Separator as Primitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/kernel";
import s from "./separator.module.css";

export type SeparatorProps = ComponentPropsWithoutRef<typeof Primitive.Root>;

/** A divider.
 *
 *  `decorative` defaults to FALSE in the primitive, so a separator is announced
 *  unless you say otherwise. That default is kept rather than inverted: a
 *  library's default surprises people when a wrapper quietly changes it, and
 *  over-announcing is noise where under-announcing is lost information.
 *
 *  Pass `decorative` for a rule that is only visual grouping — one a reader
 *  already gets from the headings around it, which is most of them. */
export function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <Primitive.Root
      orientation={orientation}
      className={cn(s.separator, orientation === "vertical" ? s.vertical : s.horizontal, className)}
      {...props}
    />
  );
}
