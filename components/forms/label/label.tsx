import { Label as Primitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/kernel";
import s from "./label.module.css";

export type LabelProps = ComponentPropsWithoutRef<typeof Primitive.Root>;

/** The only labelling implementation in the tree. The headless primitive adds
 *  click-to-focus for controls the platform does not handle natively, which is
 *  the sort of thing that should exist once. */
export function Label({ className, ...props }: LabelProps) {
  return <Primitive.Root className={cn(s.label, className)} {...props} />;
}
