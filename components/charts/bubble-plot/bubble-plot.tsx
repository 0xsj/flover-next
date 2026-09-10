import { PlotFrame } from "../plot-frame";
import { extentOf, linear, pad, px } from "../_kernel/scale";
import { categorical, radiusFor } from "../_kernel/encode";
import s from "../marks.module.css";
import { THead, TBody, Tr, Th, Td } from "@/components/display/table";
import { ChartData } from "../_shared/chart-data";

export type Bubble = {
  id: string;
  x: number;
  y: number;
  /** Mapped to AREA, not radius. */
  weight: number;
  category?: string;
  label?: string;
};

export function BubblePlot({
  bubbles: supplied,
  width = 460,
  height = 320,
  xLabel,
  yLabel,
  categories,
  title = "Bubble plot",
}: {
  bubbles: readonly Bubble[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  /** Fixed order. Assigning hue by first-seen would repaint the survivors when
   *  a filter changes what is present. */
  categories?: readonly string[];
  title?: string;
}) {
  const bubbles = supplied.filter((bubble) => Number.isFinite(bubble.x) && Number.isFinite(bubble.y) && Number.isFinite(bubble.weight) && bubble.weight >= 0);
  const m = { top: 14, right: 22, bottom: 38, left: 48 };
  const w = width - m.left - m.right;
  const h = height - m.top - m.bottom;

  const x = linear(pad(extentOf(bubbles.map((b) => b.x))), [0, w]);
  const y = linear(pad(extentOf(bubbles.map((b) => b.y))), [h, 0]);
  const weights = extentOf(bubbles.map((b) => b.weight));
  const order = categories ?? [...new Set(bubbles.map((b) => b.category ?? ""))];

  return (
    <>
    {bubbles.length ?
    <PlotFrame width={width} height={height} margin={m} x={x} y={y} xLabel={xLabel} yLabel={yLabel} title={title}>
      {bubbles.map((b) => (
        <circle
          key={b.id}
          className={s.bubble}
          cx={px(x(b.x))}
          cy={px(y(b.y))}
          r={px(radiusFor(b.weight, weights))}
          style={{ fill: categorical(order.indexOf(b.category ?? "")) ?? "var(--chart-neutral)" }}
        >
          <title>{`${b.label ?? b.id} · ${b.weight}`}</title>
        </circle>
      ))}
    </PlotFrame> : <p className={s.message}>{supplied.length ? "Measurements unavailable." : "No measurements to display."}</p>}
    <ChartData title={title}><THead><Tr><Th>Point</Th><Th>Category</Th><Th numeric>{xLabel ?? "X"}</Th><Th numeric>{yLabel ?? "Y"}</Th><Th numeric>Weight</Th></Tr></THead>
      <TBody>{supplied.map((bubble) => <Tr key={bubble.id}><Th scope="row">{bubble.label ?? bubble.id}</Th><Td>{bubble.category ?? "Uncategorized"}</Td>{[bubble.x, bubble.y, bubble.weight].map((value, index) => <Td numeric key={index}>{Number.isFinite(value) && (index !== 2 || value >= 0) ? String(value) : "Unavailable"}</Td>)}</Tr>)}</TBody>
    </ChartData>
    </>
  );
}
