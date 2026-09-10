import { seriesVariants, type SeriesVariants } from "../chart.variants";
import s from "../charts.module.css";

export type ChartSeries = SeriesVariants & { key: string; label: string };
export type ChartLegendProps = { series: readonly ChartSeries[]; label?: string };

export function ChartLegend({ series, label = "Chart legend" }: ChartLegendProps) {
  return <ul aria-label={label} className={s.legend}>
    {series.map((item) => <li key={item.key} className={seriesVariants(item)}>
      <svg viewBox="0 0 24 10" width="24" height="10" aria-hidden="true"><line x1="0" y1="5" x2="24" y2="5" className={s.stroke} /></svg>
      <span className={s.legendLabel}>{item.label}</span>
    </li>)}
  </ul>;
}
