import type { ReactNode } from "react";
import { cn } from "@/lib/kernel";
import s from "./panel.module.css";

export type PanelProps = {
  title?: ReactNode;
  /** Controls for the panel itself — not for a row inside it. */
  actions?: ReactNode;
  /** Removes the body padding, for a panel whose child owns its own edges:
   *  a table, a chart, a list that draws its own dividers. */
  flush?: boolean;
  className?: string;
  children: ReactNode;
};

/** The frame most screens are made of: a bounded region with a name. */
export function Panel({ title, actions, flush, className, children }: PanelProps) {
  return (
    <section className={cn(s.panel, className)}>
      {title || actions ? (
        <header className={s.head}>
          {title ? <h3 className={s.title}>{title}</h3> : <span />}
          {actions ? <div className={s.actions}>{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn(flush ? s.flush : s.body)}>{children}</div>
    </section>
  );
}
