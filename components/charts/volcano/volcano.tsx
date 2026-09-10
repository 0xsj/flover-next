import { PlotFrame } from "../plot-frame";
import { extentOf, linear, pad, px } from "../_kernel/scale";
import s from "../marks.module.css";
import { THead, TBody, Tr, Th, Td } from "@/components/display/table";
import { ChartData } from "../_shared/chart-data";

export type VolcanoPoint = {
  id: string;
  /** Effect size. */
  x: number;
  /** Significance, already negated-log'd by the caller — this chart does not
   *  transform data. A chart that silently logs its input is a chart whose axis
   *  label is the only place the transform is recorded. */
  y: number;
  label?: string;
};

export function Volcano({
  points: supplied,
  width = 460,
  height = 320,
  /** The two cuts. Points outside both are the finding. */
  effectCut = 1,
  significanceCut = 1.3,
  xLabel = "log₂ fold change",
  yLabel = "−log₁₀ adjusted p",
  labelled,
  title = "Volcano plot",
}: {
  points: readonly VolcanoPoint[];
  width?: number;
  height?: number;
  effectCut?: number;
  significanceCut?: number;
  xLabel?: string;
  yLabel?: string;
  /** Ids to write a name beside. Selective by design — a label on every point
   *  is a wall of text, and the ones worth naming are a judgement the caller
   *  makes, not a threshold. */
  labelled?: readonly string[];
  title?: string;
}) {
  const points = supplied.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  const m = { top: 14, right: 18, bottom: 38, left: 48 };
  const w = width - m.left - m.right;
  const h = height - m.top - m.bottom;

  const x = linear(pad(extentOf(points.map((p) => p.x))), [0, w]);
  const y = linear(pad([0, Math.max(...points.map((p) => p.y), significanceCut)]), [h, 0]);
  const named = new Set(labelled ?? []);

  return (
    <>
    {points.length ?
    <PlotFrame
      width={width} height={height} margin={m} x={x} y={y}
      xLabel={xLabel} yLabel={yLabel} title={title}
      rules={[{ y: significanceCut }, { x: effectCut }, { x: -effectCut }]}
    >
      {points.map((p) => {
        // Three states, and "not significant" is one of them rather than an
        // absence. A grey point is a measured result.
        const state =
          p.y < significanceCut ? "quiet" : p.x >= effectCut ? "up" : p.x <= -effectCut ? "down" : "quiet";
        return (
          <circle
            key={p.id}
            className={s.point}
            data-state={state}
            cx={px(x(p.x))}
            cy={px(y(p.y))}
            r={state === "quiet" ? 2 : 2.9}
          >
            <title>{`${p.label ?? p.id} · ${p.x.toFixed(2)} · ${p.y.toFixed(2)}`}</title>
          </circle>
        );
      })}

      {points.filter((p) => named.has(p.id)).map((p) => (
        <text key={`l${p.id}`} className={s.pointLabel} x={px(x(p.x) + 5)} y={px(y(p.y) + 3)}>
          {p.label ?? p.id}
        </text>
      ))}
    </PlotFrame> : <p className={s.message}>{supplied.length ? "Measurements unavailable." : "No measurements to display."}</p>}
    <ChartData title={title}><THead><Tr><Th>Point</Th><Th numeric>{xLabel}</Th><Th numeric>{yLabel}</Th><Th>Threshold</Th></Tr></THead>
      <TBody>{supplied.map((point) => <Tr key={point.id}><Th scope="row">{point.label ?? point.id}</Th><Td numeric>{Number.isFinite(point.x) ? String(point.x) : "Unavailable"}</Td><Td numeric>{Number.isFinite(point.y) ? String(point.y) : "Unavailable"}</Td><Td>{!Number.isFinite(point.x) || !Number.isFinite(point.y) ? "Unavailable" : point.y >= significanceCut && Math.abs(point.x) >= effectCut ? point.x >= 0 ? "Positive" : "Negative" : "Below threshold"}</Td></Tr>)}</TBody>
    </ChartData>
    </>
  );
}
