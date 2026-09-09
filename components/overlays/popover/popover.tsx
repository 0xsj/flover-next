"use client";

import { Popover as Primitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/kernel";
import surface from "../../surface.module.css";
import s from "./popover.module.css";

export type PopoverProps = ComponentPropsWithoutRef<typeof Primitive.Root>;
export type PopoverContentProps = ComponentPropsWithoutRef<typeof Primitive.Content>;

export const Popover = (props: PopoverProps) => <Primitive.Root {...props} />;
export const PopoverTrigger = (props: ComponentPropsWithoutRef<typeof Primitive.Trigger>) =>
  <Primitive.Trigger {...props} />;
export const PopoverClose = (props: ComponentPropsWithoutRef<typeof Primitive.Close>) =>
  <Primitive.Close {...props} />;

/** Focusable, dismissible content anchored to a trigger.
 *
 *  NOT a tooltip: a popover may contain controls, takes focus, and is dismissed
 *  deliberately. If the content is a hint about something that already has a
 *  name, it is a tooltip and putting it here makes it unreachable by pointer
 *  users who never click and unclosable by keyboard users who never opened it. */
export function PopoverContent({ className, sideOffset = 6, ...props }: PopoverContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        sideOffset={sideOffset}
        className={cn(surface.elevated, s.content, className)}
        {...props}
      />
    </Primitive.Portal>
  );
}
