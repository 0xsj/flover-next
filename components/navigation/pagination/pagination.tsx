"use client";

import { Button } from "@/components/forms";
import { ChevronLeft, ChevronRight } from "@/components/utility";
import { cn } from "@/lib/kernel";
import { pageItems } from "./pages";
import s from "./pagination.module.css";

export type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
  className?: string;
};
export function Pagination({ page, totalPages, onPageChange, label = "Pagination", className }: PaginationProps) {
  const total = Number.isFinite(totalPages) ? Math.max(0, Math.floor(totalPages)) : 0;
  if (total <= 1) return null;
  const current = Number.isFinite(page) ? Math.max(1, Math.min(Math.floor(page), total)) : 1;
  return <nav className={cn(s.pagination, className)} aria-label={label}>
    <Button size="sm" intent="ghost" disabled={current === 1} onClick={() => onPageChange(current - 1)} aria-label="Previous page"><ChevronLeft size={14} aria-hidden="true" /><span className={s.word}>Previous</span></Button>
    <ol className={s.pages}>
      {pageItems(current, total).map((item) => <li key={item}>
        {typeof item === "number" ? <Button size="sm" intent={item === current ? "secondary" : "ghost"}
          aria-label={`Page ${item}`} aria-current={item === current ? "page" : undefined}
          onClick={() => onPageChange(item)}>{item}</Button> : <span className={s.gap} aria-hidden="true">…</span>}
      </li>)}
    </ol>
    <Button size="sm" intent="ghost" disabled={current === total} onClick={() => onPageChange(current + 1)} aria-label="Next page"><span className={s.word}>Next</span><ChevronRight size={14} aria-hidden="true" /></Button>
  </nav>;
}
