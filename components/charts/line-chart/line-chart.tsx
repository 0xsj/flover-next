import { Table, THead, TBody, Tr, Th, Td } from "@/components/display/table";
import type { ChartSeries } from "../chart-legend";
import { seriesVariants } from "../chart.variants";
import s from "../charts.module.css";

export type LineDatum = { label: string; values: Readonly<Record<string, number | null>> };
export type LineChartProps = {
  label: string;
  data: readonly LineDatum[];
  series: readonly ChartSeries[];
  formatValue?: (value: number) => string;
};
const format = (value: number) => String(value);
const tickFormat = (value: number) => value.toLocaleString("en-US", {
  maximumSignificantDigits: 3,
  notation: Math.abs(value) >= 1000000 || (value !== 0 && Math.abs(value) < 0.01) ? "scientific" : "standard",
});
const valid = (value: number | null | undefined): value is number => typeof value === "number" && Number.isFinite(value);

export function LineChart({ label, data, series, formatValue = format }: LineChartProps) {
  if (!data.length || !series.length) return <p className={s.empty}>No measurements to display.</p>;
  let low = 0;
  let high = 0;
  let measured = false;
  for (const item of data) for (const entry of series) {
    const value = item.values[entry.key];
    if (valid(value)) { measured = true; low = Math.min(low, value); high = Math.max(high, value); }
  }
  if (low === high) high = 1;
  // Normalize before subtracting so even opposite finite extremes cannot
  // overflow the domain and turn the SVG coordinates into NaN.
  const scale = Math.max(Math.abs(low), Math.abs(high));
  const x = (index: number) => data.length === 1 ? 322 : 64 + index / (data.length - 1) * 516;
  const y = (value: number) => 18 + (high / scale - value / scale) / (high / scale - low / scale) * 172;
  const ticks = [high, (high / 2 + low / 2), low];
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));
  return <div className={s.lineChart}>
    {measured ? <div className={s.chartViewport} role="region" tabIndex={0} aria-label={`${label} plot — scroll horizontally on small screens`}>
    <svg viewBox="0 0 608 230" className={s.svg} role="img" aria-label={`${label}. Exact values in the data table below.`}>
      {ticks.map((tick, i) => <g key={i} className={s.axis}>
        <line x1="64" y1={y(tick)} x2="580" y2={y(tick)} className={s.gridLine} />
        <text x="54" y={y(tick)} dy="0.35em" textAnchor="end">{formatValue === format ? tickFormat(tick) : formatValue(tick)}</text>
      </g>)}
      {low < 0 && high > 0 && <line x1="64" y1={y(0)} x2="580" y2={y(0)} className={s.zeroLine} />}
      {data.map((item, index) => index % labelEvery === 0 || index === data.length - 1 ?
        <text key={index} x={x(index)} y="216" textAnchor={index === 0 ? "start" : index === data.length - 1 ? "end" : "middle"} className={s.axis}>{item.label}</text> : null)}
      {series.map((entry) => {
        let connected = false;
        const path = data.map((item, index) => {
          const value = item.values[entry.key];
          if (!valid(value)) { connected = false; return ""; }
          const command = connected ? "L" : "M";
          connected = true;
          return `${command}${x(index)},${y(value)}`;
        }).join(" ");
        return <g key={entry.key} className={seriesVariants(entry)}>
          <path d={path} className={s.stroke} fill="none" />
          {data.map((item, index) => {
            const value = item.values[entry.key];
            return valid(value) ? <circle key={index} cx={x(index)} cy={y(value)} r="3" fill="currentColor"><title>{`${entry.label}, ${item.label}: ${formatValue(value)}`}</title></circle> : null;
          })}
        </g>;
      })}
    </svg>
    </div> : <p className={s.empty}>Measurements unavailable.</p>}
    <details className={s.data}><summary>View data for {label}</summary>
      <Table caption={label}><THead><Tr><Th>Period</Th>{series.map((entry) => <Th numeric key={entry.key}>{entry.label}</Th>)}</Tr></THead>
        <TBody>{data.map((item, index) => <Tr key={index}><Th scope="row">{item.label}</Th>{series.map((entry) => {
          const value = item.values[entry.key];
          return <Td numeric key={entry.key}>{valid(value) ? formatValue(value) : "Unavailable"}</Td>;
        })}</Tr>)}</TBody>
      </Table>
    </details>
  </div>;
}
