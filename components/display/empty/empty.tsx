import type { ReactNode } from "react";
import { cn } from "@/lib/kernel";
import s from "./empty.module.css";

export type EmptyProps = {
  /** What is absent, said plainly. "No targets yet", not "No data". */
  title: string;
  body?: ReactNode;
  /** The thing to do about it, when there is one. */
  action?: ReactNode;
  className?: string;
};

/** Looked, and found nothing — which is an ANSWER and should read like one.
 *
 *  Distinct from a failure surface on purpose: an empty list is a successful
 *  request, and rendering it in error styling teaches people to treat a working
 *  system as broken. */
export function Empty({ title, body, action, className }: EmptyProps) {
  return (
    <div className={cn(s.empty, className)}>
      <p className={s.title}>{title}</p>
      {body ? <p className={s.body}>{body}</p> : null}
      {action ? <div className={s.action}>{action}</div> : null}
    </div>
  );
}
