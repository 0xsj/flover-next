import { Children, Fragment, type AnchorHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/kernel";
import s from "./breadcrumb.module.css";

export type BreadcrumbProps = {
  /** Named, because a page can have more than one navigation and "navigation"
   *  said twice tells a reader nothing. */
  label?: string;
  separator?: string;
  className?: string;
  children: ReactNode;
};

/** Where this page sits. An ordered list inside a named nav, because the order
 *  is the meaning — and the separators are markup rather than generated
 *  content, so they can be hidden from a reader with certainty. */
export function Breadcrumb({
  label = "Breadcrumb", separator = "/", className, children,
}: BreadcrumbProps) {
  const items = Children.toArray(children);

  return (
    <nav aria-label={label} className={cn(s.nav, className)}>
      <ol className={s.list}>
        {items.map((item, i) => (
          <Fragment key={i}>
            {i > 0 ? <li aria-hidden="true" className={s.separator}>{separator}</li> : null}
            <li className={s.item}>{item}</li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

export type BreadcrumbLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export function BreadcrumbLink({ className, ...props }: BreadcrumbLinkProps) {
  return <a className={cn(s.link, className)} {...props} />;
}

/** The last crumb, and NOT a link.
 *
 *  A link to the page you are on is a control that does nothing — it is offered,
 *  focused, activated, and the page does not change. `aria-current="page"`
 *  carries the meaning; the anchor was never doing anything. */
export function BreadcrumbCurrent({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span aria-current="page" className={cn(s.current, className)}>
      {children}
    </span>
  );
}
