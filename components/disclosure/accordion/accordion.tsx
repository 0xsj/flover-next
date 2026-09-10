"use client";

import { Accordion as Primitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";
import { ChevronDown } from "@/components/utility";
import { cn } from "@/lib/kernel";
import s from "./accordion.module.css";

export type AccordionProps = ComponentPropsWithoutRef<typeof Primitive.Root>;
export function Accordion({ className, ...props }: AccordionProps) {
  return <Primitive.Root className={cn(s.root, className)} {...props} />;
}
export function AccordionItem({ className, ...props }: ComponentPropsWithoutRef<typeof Primitive.Item>) {
  return <Primitive.Item className={cn(s.item, className)} {...props} />;
}
export type AccordionTriggerProps = ComponentPropsWithoutRef<typeof Primitive.Trigger> & {
  level?: 2 | 3 | 4 | 5 | 6;
};
export function AccordionTrigger({ level = 3, className, children, ...props }: AccordionTriggerProps) {
  const Tag = `h${level}` as const;
  return (
    <Primitive.Header asChild>
      <Tag className={s.heading}>
        <Primitive.Trigger className={cn(s.trigger, className)} {...props}>
          <span>{children}</span><ChevronDown size={14} className={s.chevron} aria-hidden="true" />
        </Primitive.Trigger>
      </Tag>
    </Primitive.Header>
  );
}
export function AccordionContent({ className, children, ...props }: ComponentPropsWithoutRef<typeof Primitive.Content>) {
  return <Primitive.Content className={cn(s.content, className)} {...props}><div className={s.inner}>{children}</div></Primitive.Content>;
}
