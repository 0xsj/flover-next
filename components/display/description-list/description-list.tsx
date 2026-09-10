import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/kernel";
import s from "./description-list.module.css";

export function DescriptionList({ className, ...props }: HTMLAttributes<HTMLDListElement>) {
  return <dl className={cn(s.list, className)} {...props} />;
}
export type DescriptionItemProps = HTMLAttributes<HTMLDivElement> & { term: ReactNode };
export function DescriptionItem({ term, children, className, ...props }: DescriptionItemProps) {
  return <div className={cn(s.item, className)} {...props}><dt className={s.term}>{term}</dt><dd className={s.value}>{children}</dd></div>;
}
