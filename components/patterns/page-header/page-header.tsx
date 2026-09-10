import type { HTMLAttributes, ReactNode } from "react";
import { Heading, Text, type HeadingProps } from "@/components/typography";
import { cn } from "@/lib/kernel";
import s from "./page-header.module.css";

export type PageHeaderProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  level?: HeadingProps["level"];
};
export function PageHeader({ title, description, leading, actions, level = 1, className, ...props }: PageHeaderProps) {
  return (
    <header className={cn(s.header, className)} {...props}>
      {leading ? <div className={s.leading}>{leading}</div> : null}
      <div className={s.row}>
        <div className={s.copy}>
          <Heading level={level} size="lg">{title}</Heading>
          {description ? <Text tone="muted" measure>{description}</Text> : null}
        </div>
        {actions ? <div className={s.actions}>{actions}</div> : null}
      </div>
    </header>
  );
}
