"use client";

import { Tabs as Primitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/kernel";
import s from "./tabs.module.css";

export type TabsProps = ComponentPropsWithoutRef<typeof Primitive.Root>;
export type TabsListProps = ComponentPropsWithoutRef<typeof Primitive.List>;
export type TabProps = ComponentPropsWithoutRef<typeof Primitive.Trigger>;
export type TabPanelProps = ComponentPropsWithoutRef<typeof Primitive.Content>;

/** `activationMode` defaults to `automatic` in the primitive, and that default
 *  is kept: arrowing to a tab shows its panel, which is the platform contract
 *  and what a keyboard user expects.
 *
 *  Pass `activationMode="manual"` when showing a panel is EXPENSIVE — a fetch,
 *  a chart, a heavy render. Then arrows move focus and Enter commits, so
 *  travelling past four tabs costs one panel rather than four. */
export function Tabs(props: TabsProps) {
  return <Primitive.Root {...props} />;
}

export function TabsList({ className, ...props }: TabsListProps) {
  return <Primitive.List className={cn(s.list, className)} {...props} />;
}

export function Tab({ className, ...props }: TabProps) {
  return <Primitive.Trigger className={cn(s.tab, className)} {...props} />;
}

export function TabPanel({ className, ...props }: TabPanelProps) {
  return <Primitive.Content className={cn(s.panel, className)} {...props} />;
}
