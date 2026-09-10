"use client";

import { useId, useState, type ReactNode } from "react";
import { Button } from "@/components/forms";
import { PanelLeftClose, PanelLeftOpen } from "@/components/utility";
import { cn } from "@/lib/kernel";
import s from "./rail-shell.module.css";

type SidebarState =
  | { sidebarOpen: boolean; onSidebarOpenChange: (open: boolean) => void; defaultSidebarOpen?: never }
  | { sidebarOpen?: never; defaultSidebarOpen?: boolean; onSidebarOpenChange?: (open: boolean) => void };
export type RailShellProps = SidebarState & {
  rail: ReactNode;
  sidebar: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  sidebarLabel?: string;
  className?: string;
};
export function RailShell({ rail, sidebar, header, children, sidebarLabel = "Section navigation", className,
  sidebarOpen, defaultSidebarOpen = true, onSidebarOpenChange }: RailShellProps) {
  const id = useId();
  const [localOpen, setLocalOpen] = useState(defaultSidebarOpen);
  const open = sidebarOpen ?? localOpen;
  function toggle() {
    if (sidebarOpen === undefined) setLocalOpen(!open);
    onSidebarOpenChange?.(!open);
  }
  return <div className={cn(s.shell, className)}>
    <div className={s.frame} data-sidebar-open={open || undefined}>
      <a href={`#${id}-content`} className={s.skip}>Skip to content</a>
      <div className={s.rail}>{rail}</div>
      <aside id={`${id}-sidebar`} className={s.sidebar} aria-label={sidebarLabel} hidden={!open}>{sidebar}</aside>
      <header className={s.header}>
        <Button intent="ghost" size="icon" aria-label={open ? "Hide section navigation" : "Show section navigation"} aria-expanded={open} aria-controls={`${id}-sidebar`} onClick={toggle}>
          {open ? <PanelLeftClose size={17} aria-hidden="true" /> : <PanelLeftOpen size={17} aria-hidden="true" />}
        </Button>
        <div className={s.headerContent}>{header}</div>
      </header>
      <main id={`${id}-content`} tabIndex={-1} className={s.main}>{children}</main>
    </div>
  </div>;
}
