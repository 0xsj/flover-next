import type { ReactNode } from "react";
import { Mark } from "@/components/chrome";
import { cn } from "@/lib/kernel";
import surface from "../../surface.module.css";
import s from "./auth-shell.module.css";

export type AuthShellProps = {
  /** REQUIRED, and rendered as the page's `h1`.
   *
   *  A sign-in page whose only heading is a wordmark gives a reader arriving by
   *  keyboard or by screen reader nothing to orient on. Making it a prop means
   *  a screen cannot forget, and means the wordmark above stays a lockup rather
   *  than being pressed into service as a heading. */
  title: string;
  description?: string;
  /** Under the card: the link to the other door, usually. */
  footer?: ReactNode;
  children: ReactNode;
  /** On the PAGE element, which is the outer one — so a caller framing this
   *  inside something smaller than a viewport can say so. */
  className?: string;
};

/** The frame every unauthenticated screen shares.
 *
 *  It owns the arrangement — centred, one column, a card — and nothing else. No
 *  form, no fields, no submit: those differ per screen and putting them here is
 *  how a shell acquires a `mode` prop and then four of them. */
export function AuthShell({ title, description, footer, children, className }: AuthShellProps) {
  return (
    <div className={cn(s.page, className)}>
      <div className={s.column}>
        <Mark className={s.brand} />

        <div className={cn(surface.elevated, s.card)}>
          <div className={s.head}>
            <h1 className={s.title}>{title}</h1>
            {description ? <p className={s.description}>{description}</p> : null}
          </div>
          {children}
        </div>

        {footer ? <div className={s.foot}>{footer}</div> : null}
      </div>
    </div>
  );
}
