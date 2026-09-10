import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/kernel";
import s from "./collection-toolbar.module.css";

export type CollectionToolbarProps = HTMLAttributes<HTMLDivElement> & {
  summary?: ReactNode;
  actions?: ReactNode;
};
/** A layout for separately labelled controls, not an ARIA toolbar with roving focus. */
export function CollectionToolbar({ children, summary, actions, className, ...props }: CollectionToolbarProps) {
  return <div className={cn(s.toolbar, className)} {...props}>
    <div className={s.controls}>{children}</div>
    <div className={s.trailing}>
      {summary ? <div className={s.summary}>{summary}</div> : null}
      {actions}
    </div>
  </div>;
}
