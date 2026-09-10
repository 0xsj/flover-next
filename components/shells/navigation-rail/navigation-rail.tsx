"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { NavLink, type NavLinkProps } from "@/components/navigation";
import { Tooltip, TooltipProvider } from "@/components/overlays";
import { cn } from "@/lib/kernel";
import s from "./navigation-rail.module.css";

export type NavigationRailProps = HTMLAttributes<HTMLDivElement> & { brand?: ReactNode; footer?: ReactNode; label?: string };
export function NavigationRail({ brand, footer, label = "Application sections", children, className, ...props }: NavigationRailProps) {
  return <TooltipProvider><div className={cn(s.rail, className)} {...props}>
    {brand && <div className={s.brand}>{brand}</div>}
    <nav className={s.items} aria-label={label}>{children}</nav>
    {footer && <div className={s.footer}>{footer}</div>}
  </div></TooltipProvider>;
}
export type RailLinkProps = Omit<NavLinkProps, "aria-label"> & { label: string; description?: string };
export function RailLink({ label, description, active, className, ...props }: RailLinkProps) {
  return <Tooltip side="right" content={description ?? label}>
    <NavLink className={cn(s.link, className)} active={active} aria-current={active ? "true" : undefined} aria-label={label} {...props} />
  </Tooltip>;
}
