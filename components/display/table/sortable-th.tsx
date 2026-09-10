"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "@/components/utility";
import { Th, type ThProps } from "./table";
import s from "./table.module.css";

export type SortableThProps = Omit<ThProps, "children" | "aria-sort"> & {
  children: ReactNode;
  direction: "ascending" | "descending" | "none";
  onSort: () => void;
};
export function SortableTh({ children, direction, onSort, ...props }: SortableThProps) {
  const Icon = direction === "ascending" ? ArrowUp : direction === "descending" ? ArrowDown : ArrowUpDown;
  return <Th aria-sort={direction} {...props}>
    <button type="button" className={s.sort} onClick={onSort}>{children}<Icon size={12} aria-hidden="true" /></button>
  </Th>;
}
