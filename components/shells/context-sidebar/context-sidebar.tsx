import type { HTMLAttributes, ReactNode } from "react";
import { Heading, Text, type HeadingProps } from "@/components/typography";
import { cn } from "@/lib/kernel";
import s from "./context-sidebar.module.css";

export type ContextSidebarProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  level?: HeadingProps["level"];
};
export function ContextSidebar({ title, description, footer, level = 2, children, className, ...props }: ContextSidebarProps) {
  return <div className={cn(s.sidebar, className)} {...props}>
    <div className={s.header}><Heading level={level} size="sm">{title}</Heading>{description && <Text size="sm" tone="quiet">{description}</Text>}</div>
    <div className={s.content}>{children}</div>
    {footer && <div className={s.footer}>{footer}</div>}
  </div>;
}
