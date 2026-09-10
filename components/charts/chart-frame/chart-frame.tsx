import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/kernel";
import s from "../charts.module.css";

export type ChartFrameProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  legend?: ReactNode;
  footer?: ReactNode;
};

export function ChartFrame({ title, description, actions, legend, footer, children, className, ...props }: ChartFrameProps) {
  return <figure className={cn(s.frame, className)} {...props}>
    <figcaption className={s.header}>
      <div><div className={s.title}>{title}</div>{description && <div className={s.description}>{description}</div>}</div>
      {actions && <div className={s.actions}>{actions}</div>}
    </figcaption>
    {legend}
    <div className={s.plot}>{children}</div>
    {footer && <div className={s.footer}>{footer}</div>}
  </figure>;
}
