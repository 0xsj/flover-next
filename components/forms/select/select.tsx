"use client";

import { Select as Primitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";
import { Check, ChevronDown } from "@/components/utility";
import { cn } from "@/lib/kernel";
import surface from "../../surface.module.css";
import s from "./select.module.css";

/* A value bound to a form — NOT a menu. See doc.ts: the two look alike and are
   different controls, and choosing wrong is announced wrong. */

export type SelectProps = ComponentPropsWithoutRef<typeof Primitive.Root>;
export type SelectTriggerProps = ComponentPropsWithoutRef<typeof Primitive.Trigger>;
export type SelectContentProps = ComponentPropsWithoutRef<typeof Primitive.Content>;
export type SelectItemProps = ComponentPropsWithoutRef<typeof Primitive.Item>;

export function Select(props: SelectProps) {
  return <Primitive.Root {...props} />;
}

export function SelectValue(props: ComponentPropsWithoutRef<typeof Primitive.Value>) {
  return <Primitive.Value {...props} />;
}

export function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  return (
    <Primitive.Trigger className={cn(s.trigger, className)} {...props}>
      {children}
      <Primitive.Icon asChild>
        <ChevronDown size={14} strokeWidth={1.7} className={s.chevron} aria-hidden="true" />
      </Primitive.Icon>
    </Primitive.Trigger>
  );
}

export function SelectContent({ className, position = "popper", children, ...props }: SelectContentProps) {
  return (
    // Portalled, so an overflow-hidden ancestor cannot clip the list — the
    // commonest way a select becomes unusable in a scrolling panel.
    <Primitive.Portal>
      <Primitive.Content
        position={position}
        sideOffset={6}
        className={cn(surface.elevated, s.content, className)}
        {...props}
      >
        <Primitive.Viewport className={s.viewport}>{children}</Primitive.Viewport>
      </Primitive.Content>
    </Primitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <Primitive.Item className={cn(s.item, className)} {...props}>
      <Primitive.ItemText>{children}</Primitive.ItemText>
      <Primitive.ItemIndicator asChild>
        <Check size={13} strokeWidth={2.4} className={s.tick} aria-hidden="true" />
      </Primitive.ItemIndicator>
    </Primitive.Item>
  );
}
