import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/kernel";
import s from "./table.module.css";

/* Compositional rather than data-driven.
 *
 * A `<Table columns={} rows={} />` has to grow a renderer prop per column the
 * moment one cell is not a string — and every one of them re-invents markup the
 * platform already has. Composition costs a few more lines at the call site and
 * never runs out. */

export type TableProps = TableHTMLAttributes<HTMLTableElement> & { caption?: string; scrollLabel?: string };

export function Table({ caption, scrollLabel, className, children, ...props }: TableProps) {
  return (
    <div className={s.scroll} tabIndex={0} role="region" aria-label={scrollLabel ?? caption ?? "Scrollable table"}>
      <table className={cn(s.table, className)} {...props}>
        {/* Named for a reader even when the heading above it is visible: a
            table reached by jumping between tables has no surrounding context. */}
        {caption ? <caption className={s.caption}>{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

export const THead = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn(s.head, className)} {...props} />
);
export const TBody = (props: HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props} />;
export const TFoot = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => <tfoot className={cn(s.foot, className)} {...props} />;
export const Tr = ({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) => <tr className={cn(s.row, className)} {...props} />;

export type ThProps = ThHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean };

/** Always carries a scope. Without one a reader cannot tell whether a header
 *  describes its column or its row, and a wide table becomes unreadable. */
export function Th({ className, numeric, scope = "col", ...props }: ThProps) {
  return <th scope={scope} className={cn(s.th, numeric && s.numeric, className)} {...props} />;
}

export type TdProps = TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean };

export function Td({ className, numeric, ...props }: TdProps) {
  return <td className={cn(s.td, numeric && s.numeric, className)} {...props} />;
}
