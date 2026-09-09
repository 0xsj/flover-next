"use client";

import { DropdownMenu as Primitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/kernel";
import surface from "../../surface.module.css";
import s from "./dropdown-menu.module.css";

export type DropdownMenuProps = ComponentPropsWithoutRef<typeof Primitive.Root>;
export type DropdownMenuContentProps = ComponentPropsWithoutRef<typeof Primitive.Content>;
export type DropdownMenuItemProps = ComponentPropsWithoutRef<typeof Primitive.Item>;

export const DropdownMenu = (props: DropdownMenuProps) => <Primitive.Root {...props} />;
export const DropdownMenuTrigger = (props: ComponentPropsWithoutRef<typeof Primitive.Trigger>) =>
  <Primitive.Trigger {...props} />;

/** A list of ACTIONS. Not a Select: a menu has no current value, nothing is
 *  submitted, and reopening it shows the same list. See the select's doc. */
export function DropdownMenuContent({ className, sideOffset = 6, align = "start", ...props }: DropdownMenuContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(surface.elevated, s.content, className)}
        {...props}
      />
    </Primitive.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }: DropdownMenuItemProps) {
  return <Primitive.Item className={cn(s.item, className)} {...props} />;
}

export const DropdownMenuLabel = ({ className, ...props }: ComponentPropsWithoutRef<typeof Primitive.Label>) =>
  <Primitive.Label className={cn(s.label, className)} {...props} />;

export const DropdownMenuSeparator = ({ className, ...props }: ComponentPropsWithoutRef<typeof Primitive.Separator>) =>
  <Primitive.Separator className={cn(s.separator, className)} {...props} />;
