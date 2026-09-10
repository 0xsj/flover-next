import { seriesVariants, type SeriesVariants } from "../chart.variants";
import s from "../charts.module.css";

export type BarDatum = { label: string; value: number | null };
export type BarChartProps = Pick<SeriesVariants, "tone"> & {
  label: string;
  data: readonly BarDatum[];
  formatValue?: (value: number) => string;
};
const format = (value: number) => String(value);
const valid = (value: number | null): value is number => value !== null && Number.isFinite(value) && value >= 0;

export function BarChart({ label, data, tone, formatValue = format }: BarChartProps) {
  const maximum = data.reduce((max, item) => valid(item.value) ? Math.max(max, item.value) : max, 0);
  return <section aria-label={label} className={s.bars}>
    {data.length === 0 ? <p className={s.empty}>No measurements to display.</p> : <ul className={s.barList}>
      {data.map((item, index) => <li className={s.barRow} key={`${item.label}-${index}`}>
        <span className={s.barLabel}>{item.label}</span>
        <span className={s.barTrack} aria-hidden="true"><span className={seriesVariants({ tone })} style={{ width: `${valid(item.value) && maximum > 0 ? item.value / maximum * 100 : 0}%` }} /></span>
        <span className={s.barValue}>{valid(item.value) ? formatValue(item.value) : "Unavailable"}</span>
      </li>)}
    </ul>}
  </section>;
}
