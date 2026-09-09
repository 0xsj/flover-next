import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/kernel";
import s from "./table.module.css";

/* Compositional rather than data-driven.
 *
 * A `<Table columns={} rows={} />` has to grow a renderer prop per column the
 * moment one cell is not a string — and every one of them re-invents markup the
 * platform already has. Composition costs a few more lines at the call site and
 * never runs out. */

export type TableProps = { caption?: string; className?: string; children: ReactNode };

export function Table({ caption, className, children }: TableProps) {
  return (
    <div className={s.scroll}>
      <table className={cn(s.table, className)}>
        {/* Named for a reader even when the heading above it is visible: a
            table reached by jumping between tables has no surrounding context. */}
        {caption ? <caption className={s.caption}>{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

export const THead = ({ children }: { children: ReactNode }) => (
  <thead className={s.head}>{children}</thead>
);
export const TBody = ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>;
export const Tr = ({ children }: { children: ReactNode }) => <tr className={s.row}>{children}</tr>;

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
