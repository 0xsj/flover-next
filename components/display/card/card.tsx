import { Slot } from "radix-ui";
import type { AnchorHTMLAttributes, HTMLAttributes, ReactElement, ReactNode } from "react";
import { Heading, type HeadingProps } from "@/components/typography";
import { cn } from "@/lib/kernel";
import s from "./card.module.css";

export type CardProps = HTMLAttributes<HTMLElement> & { as?: "article" | "div" };
export function Card({ as: Tag = "article", className, ...props }: CardProps) {
  return <Tag className={cn(s.card, className)} {...props} />;
}

export type CardHeaderProps = HTMLAttributes<HTMLDivElement> & { leading?: ReactNode; actions?: ReactNode };
export function CardHeader({ leading, actions, children, className, ...props }: CardHeaderProps) {
  return <div className={cn(s.header, className)} {...props}>
    {leading != null && <div className={s.leading}>{leading}</div>}
    <div className={s.heading}>{children}</div>
    {actions != null && <CardAction>{actions}</CardAction>}
  </div>;
}

export function CardTitle({ className, size = "sm", ...props }: HeadingProps) {
  return <Heading size={size} className={cn(s.title, className)} {...props} />;
}
export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn(s.description, className)} {...props} />;
}
export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(s.body, className)} {...props} />;
}
export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(s.footer, className)} {...props} />;
}
export function CardMedia({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(s.media, className)} {...props} />;
}
export function CardAction({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(s.action, className)} {...props} />;
}

export type CardLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & (
  | { asChild?: false; href: string }
  | { asChild: true; children: ReactElement }
);
/** One primary destination. Other controls belong in CardAction/CardFooter. */
export function CardLink({ asChild, className, ...props }: CardLinkProps) {
  const Tag = asChild ? Slot.Root : "a";
  return <Tag className={cn(s.link, className)} {...props} />;
}
