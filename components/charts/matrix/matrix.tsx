import { band, px } from "../_kernel/scale";
import { divergingFill, sequentialFill } from "../_kernel/encode";
import s from "../marks.module.css";
import { Button } from "@/components/forms";
import { THead, TBody, Tr, Th, Td } from "@/components/display/table";
import { ChartData } from "../_shared/chart-data";

/** Four states inherited from Overwatch: a measurement, measured absence,
 *  an unanswered question, and a question that does not apply. Keeping them
 *  distinct preserves coverage semantics as well as the picture. */
export type Cell =
  | { state: "value"; value: number }
  /** Looked, and there was nothing. A measured zero. */
  | { state: "absent" }
  /** Nobody asked. Not the same as a zero and never rendered as one. */
  | { state: "unattempted" }
  /** There is no question to ask here. Excluded from the ratio entirely. */
  | { state: "na" };

export type MatrixProps = {
  rows: readonly string[];
  columns: readonly string[];
  cell: (row: string, column: string) => Cell;
  width?: number;
  height?: number;
  /** `diverging` is signed about a midpoint; `sequential` is magnitude only. */
  ramp?: "diverging" | "sequential";
  /** Only for `diverging`. */
  midpoint?: number;
  extent?: number;
  title?: string;
  onSelect?: (row: string, column: string) => void;
};

export function Matrix({
  rows,
  columns,
  cell: readCell,
  width = 520,
  height,
  ramp = "sequential",
  midpoint = 0,
  extent,
  title = "Coverage matrix",
  onSelect,
}: MatrixProps) {
  const sampled = new Map(rows.map((row) => [row, new Map(columns.map((column) => [column, readCell(row, column)]))]));
  const cell = (row: string, column: string) => sampled.get(row)!.get(column)!;
  const m = { top: 8, right: 8, bottom: 76, left: 128 };
  const w = Math.max(1, width - m.left - m.right);
  const cellSize = Math.max(8, w / Math.max(1, columns.length));
  const h = height === undefined ? cellSize * rows.length : Math.max(1, height - m.top - m.bottom);
  const total = height ?? h + m.top + m.bottom;

  const x = band(columns, [0, w], 0.06);
  const y = band(rows, [0, h], 0.06);

  const span =
    extent ??
    Math.max(
      1e-9,
      ...rows.flatMap((r) =>
        columns.map((c) => {
          const v = cell(r, c);
          return v.state === "value" && Number.isFinite(v.value) ? Math.abs(v.value - midpoint) : 0;
        }),
      ),
    );

  return (
    <>
    {rows.length && columns.length ? <div className={s.viewport} role="region" aria-label={`${title} plot`} tabIndex={0}>
    <svg viewBox={`0 0 ${px(width)} ${px(total)}`}
      width={px(width)}
      height={px(total)} className={s.matrix} role={onSelect ? "group" : "img"} aria-label={title}>
      {title ? <title>{title}</title> : null}
      <g transform={`translate(${px(m.left)} ${px(m.top)})`}>
        {rows.map((r) =>
          columns.map((c) => {
            const v = cell(r, c);
            const fill =
              v.state !== "value" || !Number.isFinite(v.value)
                ? undefined
                : ramp === "diverging"
                  ? divergingFill((v.value - midpoint) / span)
                  : sequentialFill((v.value - midpoint) / span);
            return (
              <rect
                key={`${r}|${c}`}
                className={s.cell}
                data-state={v.state === "value" && !Number.isFinite(v.value) ? "unavailable" : v.state}
                x={px(x(c))}
                y={px(y(r))}
                width={px(x.bandWidth)}
                height={px(y.bandWidth)}
                style={fill ? { fill } : undefined}
                onClick={onSelect ? () => onSelect(r, c) : undefined}
                role={onSelect ? "button" : undefined}
                tabIndex={onSelect ? 0 : undefined}
                aria-label={onSelect ? `${r} · ${c} — ${describe(v)}` : undefined}
                onKeyDown={onSelect ? (event) => {
                  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(r, c); }
                } : undefined}
              >
                <title>{`${r} · ${c} — ${describe(v)}`}</title>
              </rect>
            );
          }),
        )}

        {/* `unattempted` gets a dotted outline rather than a fill, because it is
            the one state that is genuinely empty — and an empty cell with no
            mark at all is indistinguishable from a rendering failure. */}
        {rows.map((r) =>
          columns.map((c) =>
            cell(r, c).state === "unattempted" ? (
              <rect
                key={`u${r}|${c}`}
                className={s.unattempted}
                x={px(x(c) + 0.5)}
                y={px(y(r) + 0.5)}
                width={px(x.bandWidth - 1)}
                height={px(y.bandWidth - 1)}
              />
            ) : null,
          ),
        )}

        {/* `na` gets a diagonal slash — a texture, so it survives being printed
            and is never mistaken for a low value. */}
        {rows.map((r) =>
          columns.map((c) =>
            cell(r, c).state === "na" ? (
              <line
                key={`n${r}|${c}`}
                className={s.na}
                x1={px(x(c) + 2)}
                y1={px(y(r) + y.bandWidth - 2)}
                x2={px(x(c) + x.bandWidth - 2)}
                y2={px(y(r) + 2)}
              />
            ) : null,
          ),
        )}

        {rows.map((r) => (
          <text key={`r${r}`} className={s.matrixLabel} x={-6} y={px(y(r) + y.bandWidth / 2 + 3)} textAnchor="end">
            {r}
          </text>
        ))}
        {columns.map((c) => (
          <text
            key={`c${c}`}
            className={s.matrixLabel}
            transform={`translate(${px(x(c) + x.bandWidth / 2)} ${px(h + 6)}) rotate(-42)`}
            textAnchor="end"
          >
            {c}
          </text>
        ))}
      </g>
    </svg></div> : <p className={s.message}>No measurements to display.</p>}
    <ChartData title={title}><THead><Tr><Th>Item</Th>{columns.map((column) => <Th key={column}>{column}</Th>)}</Tr></THead>
      <TBody>{rows.map((row) => <Tr key={row}><Th scope="row">{row}</Th>{columns.map((column) => <Td key={column}>{onSelect ? <Button size="sm" intent="ghost" aria-label={`Select ${row} · ${column}`} onClick={() => onSelect(row, column)}>{describe(cell(row, column))}</Button> : describe(cell(row, column))}</Td>)}</Tr>)}</TBody>
    </ChartData>
    </>
  );
}

function describe(c: Cell): string {
  switch (c.state) {
    case "value": return Number.isFinite(c.value) ? String(c.value) : "Unavailable measurement";
    case "absent": return "looked, found nothing";
    case "unattempted": return "never checked";
    case "na": return "not applicable — no question to ask";
  }
}

/** N/a is excluded from both halves of coverage. Treating it as either a hit
 *  or a miss changes the ratio for a question that was never applicable.
 *  Returns null when nothing applies: a ratio over nothing is not zero. */
export function coverageOf(
  rows: readonly string[],
  columns: readonly string[],
  cell: (row: string, column: string) => Cell,
): { checked: number; applicable: number; ratio: number } | null {
  let checked = 0;
  let applicable = 0;
  for (const r of rows)
    for (const c of columns) {
      const v = cell(r, c);
      if (v.state === "na") continue;
      applicable++;
      if ((v.state === "value" && Number.isFinite(v.value)) || v.state === "absent") checked++;
    }
  return applicable === 0 ? null : { checked, applicable, ratio: checked / applicable };
}
