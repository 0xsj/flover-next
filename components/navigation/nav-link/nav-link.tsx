import { Slot } from "radix-ui";
import type { AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/kernel";
import s from "./nav-link.module.css";

export type NavLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Whether this link points at where the reader already is.
   *
   *  A PROP, not something the component works out. Reading the current route
   *  needs a router, and a router is the one thing that differs between this
   *  and the sibling templates — so the component stays portable and the caller,
   *  which is framework-specific anyway, answers the question. */
  active?: boolean;
  /** Render the caller's element — a router's link — carrying these styles and
   *  the current-page marking, without adding a wrapper. */
  asChild?: boolean;
};

/** A link that says whether it is where you are.
 *
 *  `aria-current="page"` is the whole value here, and it is the thing that gets
 *  forgotten: a nav where the active item is only a different colour tells a
 *  reader nothing about where they are. */
export function NavLink({ active, asChild, className, ...props }: NavLinkProps) {
  const Comp = asChild ? Slot.Root : "a";
  return (
    <Comp
      aria-current={active ? "page" : undefined}
      className={cn(s.link, className)}
      {...props}
    />
  );
}
