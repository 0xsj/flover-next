import type { ReactNode } from "react";
import { Mark } from "@/components/chrome";
import { cn } from "@/lib/kernel";
import s from "./app-shell.module.css";

export type AppShellProps = {
  /** The sidebar. A SLOT rather than a list of items, because the shell has no
   *  opinion about what navigation is — see `SidebarNav`, which does. */
  nav: ReactNode;
  /** The header's trailing end: the preference toggles, an account menu. */
  actions?: ReactNode;
  /** Replaces the wordmark, for a product that has its own. */
  brand?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Header, rail, main — and nothing about what goes in them.
 *
 *  # Slots, not configuration
 *
 *  Every part a product will want to change is a `ReactNode`. A shell that took
 *  `navItems`, `userName` and `showSearch` would be a bet that those are the
 *  only things that vary, and the bet is lost the first time one item needs a
 *  badge.
 *
 *  # `<main>` is here and nowhere else
 *
 *  One per page, and it is the target of a skip link and the landmark a reader
 *  jumps to. A screen that renders its own inside this one has two, and the
 *  jump stops meaning anything. */
export function AppShell({ nav, actions, brand, children, className }: AppShellProps) {
  return (
    <div className={cn(s.shell, className)}>
      <header className={s.header}>
        {brand ?? <Mark />}
        {actions ? <div className={s.actions}>{actions}</div> : null}
      </header>

      <div className={s.body}>
        <aside className={s.rail}>{nav}</aside>
        <main className={s.main}>{children}</main>
      </div>
    </div>
  );
}
