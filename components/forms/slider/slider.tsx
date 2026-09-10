"use client";

import { Slider as Primitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/kernel";
import s from "./slider.module.css";

export type SliderProps = Omit<ComponentPropsWithoutRef<typeof Primitive.Root>,
  "value" | "defaultValue" | "onValueChange" | "onValueCommit" | "children" | "orientation"> & {
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
};
export function Slider({ label, value, defaultValue, min = 0, onValueChange, onValueCommit, className, ...props }: SliderProps) {
  return (
    <Primitive.Root
      min={min} value={value === undefined ? undefined : [value]} defaultValue={[defaultValue ?? min]}
      onValueChange={onValueChange ? ([next]) => onValueChange(next) : undefined}
      onValueCommit={onValueCommit ? ([next]) => onValueCommit(next) : undefined}
      className={cn(s.root, className)} {...props}
    >
      <Primitive.Track className={s.track}><Primitive.Range className={s.range} /></Primitive.Track>
      <Primitive.Thumb className={s.thumb} aria-label={label} />
    </Primitive.Root>
  );
}
