"use client";

import { Tooltip as Primitive } from "radix-ui";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/kernel";
import s from "./tooltip.module.css";

export type TooltipProviderProps = ComponentPropsWithoutRef<typeof Primitive.Provider>;

/** Mounted once, near the root. It shares the open/close timing across every
 *  tooltip, which is what stops the second one you hover feeling slow. */
export const TooltipProvider = (props: TooltipProviderProps) => <Primitive.Provider {...props} />;

export type TooltipProps = {
  /** The hint. A tooltip is SUPPLEMENTARY — the trigger must already have a
   *  name without it, because a tooltip is unreachable by touch and by anyone
   *  who does not hover. */
  content: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  children: ReactNode;
};

export function Tooltip({ content, side = "top", children }: TooltipProps) {
  return (
    <Primitive.Root>
      <Primitive.Trigger asChild>{children}</Primitive.Trigger>
      <Primitive.Portal>
        <Primitive.Content side={side} sideOffset={6} className={cn(s.content)}>
          {content}
          <Primitive.Arrow className={s.arrow} />
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
