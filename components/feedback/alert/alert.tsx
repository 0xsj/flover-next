import type { ReactNode } from "react";
import { X } from "@/components/utility";
import { cn } from "@/lib/kernel";
import { alertVariants, type AlertVariants } from "./alert.variants";
import s from "./alert.module.css";

export type AlertProps = AlertVariants & {
  title?: ReactNode;
  children: ReactNode;
  /** What to do about it. */
  action?: ReactNode;
  /** How this should be ANNOUNCED when it appears — and absent by default,
   *  because most alerts are rendered with the page rather than arriving.
   *
   *      absent      a styled region. Read in document order like any prose.
   *      "polite"    announced when the reader finishes its sentence.
   *      "assertive" interrupts. For something the user must act on NOW.
   *
   *  A live region on a message that was there when the page loaded announces
   *  nothing anyway and costs a role that means "this is new". */
  live?: "polite" | "assertive";
  onDismiss?: () => void;
  dismissLabel?: string;
  className?: string;
};

export function Alert({
  tone, title, children, action, live, onDismiss,
  dismissLabel = "Dismiss", className,
}: AlertProps) {
  return (
    <div
      className={cn(alertVariants({ tone }), className)}
      role={live === "assertive" ? "alert" : live === "polite" ? "status" : undefined}
    >
      <div className={s.body}>
        {title ? <p className={s.title}>{title}</p> : null}
        <div className={s.text}>{children}</div>
        {action ? <div className={s.action}>{action}</div> : null}
      </div>
      {onDismiss ? (
        <button type="button" className={s.dismiss} onClick={onDismiss} aria-label={dismissLabel}>
          <X size={14} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
