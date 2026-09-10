import type { ReactNode } from "react";
import { Table } from "@/components/display/table";
import s from "../charts.module.css";

/** Ordinary HTML is the exact-value counterpart of the SVG picture. */
export function ChartData({ title, children }: { title: string; children: ReactNode }) {
  return <details className={s.data}><summary>View data for {title}</summary><Table caption={title}>{children}</Table></details>;
}
