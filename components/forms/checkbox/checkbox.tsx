"use client";

import { Checkbox as Primitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";
import { Check, Minus } from "@/components/utility";
import { cn } from "@/lib/kernel";
import s from "./checkbox.module.css";

export type CheckboxProps = ComponentPropsWithoutRef<typeof Primitive.Root>;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <Primitive.Root className={cn(s.checkbox, className)} {...props}>
      <Primitive.Indicator className={s.indicator}>
        {/* Both glyphs are present and `data-state` decides which shows.
            Indeterminate is a STATE, not a variant: a variant is chosen by the
            author, a state comes from the data. */}
        <Check size={12} strokeWidth={3} className={s.check} aria-hidden="true" />
        <Minus size={12} strokeWidth={3} className={s.mixed} aria-hidden="true" />
      </Primitive.Indicator>
    </Primitive.Root>
  );
}
