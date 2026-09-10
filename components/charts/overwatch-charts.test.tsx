import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { BubblePlot, ColourBar, GraphFrame, Matrix, RankedBar, Volcano, coverageOf, type Cell } from ".";

it("sorts ranked bars without mutating input and distinguishes repeated labels by id", async () => {
  const user = userEvent.setup();
  const bars = Object.freeze([{ id: "low", label: "Same label", value: 2 }, { id: "high", label: "Same label", value: 12 }]);
  render(<RankedBar bars={bars} title="Ranked work" />);
  const x = [...screen.getByRole("img").querySelectorAll("rect")].map((mark) => mark.getAttribute("x"));
  expect(new Set(x).size).toBe(2);
  await user.click(screen.getByText("View data for Ranked work"));
  expect(within(screen.getByRole("table")).getAllByRole("cell").map((cell) => cell.textContent)).toEqual(["12", "2"]);
  expect(bars[0].id).toBe("low");
});
it("keeps exact values and threshold meaning in the volcano data", async () => {
  const user = userEvent.setup();
  render(<Volcano title="Effects" points={[{ id: "tiny", x: 0.000001, y: 0 }, { id: "positive", x: 2, y: 3 }, { id: "negative", x: -2, y: 3 }]} />);
  await user.click(screen.getByText("View data for Effects"));
  const table = screen.getByRole("table");
  for (const name of ["0.000001", "Below threshold", "Positive", "Negative"]) expect(within(table).getByRole("cell", { name })).toBeVisible();
});
it("reports invalid bubble measurements rather than drawing NaN geometry", async () => {
  const user = userEvent.setup();
  render(<BubblePlot title="Invalid readings" bubbles={[{ id: "bad", x: NaN, y: 2, weight: -4 }]} />);
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.getByText("Measurements unavailable.")).toBeVisible();
  await user.click(screen.getByText("View data for Invalid readings"));
  expect(within(screen.getByRole("table")).getAllByRole("cell", { name: "Unavailable" })).toHaveLength(2);
});
it("keeps nonzero ticks readable for very small measurements", () => {
  render(<BubblePlot title="Small readings" bubbles={[{ id: "a", x: 0.000001, y: 0.000001, weight: 1 }, { id: "b", x: 0.000003, y: 0.000003, weight: 2 }]} />);
  const ticks = [...screen.getByRole("img").querySelectorAll("text")].map((tick) => tick.textContent);
  expect(ticks.length).toBeGreaterThan(0);
  expect(ticks).not.toContain("0.00");
  expect(ticks.some((tick) => tick?.includes("e-6"))).toBe(true);
});
it("keeps four matrix states distinct and samples each cell once per render", async () => {
  const user = userEvent.setup();
  const values: Cell[] = [{ state: "value", value: 0 }, { state: "absent" }, { state: "unattempted" }, { state: "na" }];
  const cell = vi.fn((row: string, column: string) => values[Number(row) * 2 + Number(column)]);
  render(<Matrix title="Coverage" rows={["0", "1"]} columns={["0", "1"]} cell={cell} />);
  expect(cell).toHaveBeenCalledTimes(4);
  await user.click(screen.getByText("View data for Coverage"));
  const table = screen.getByRole("table");
  for (const name of ["0", "looked, found nothing", "never checked", "not applicable — no question to ask"]) expect(within(table).getByRole("cell", { name })).toBeVisible();
  expect(coverageOf(["0", "1"], ["0", "1"], cell)).toEqual({ checked: 2, applicable: 3, ratio: 2 / 3 });
  expect(coverageOf(["0"], ["0"], () => ({ state: "na" }))).toBeNull();
});
it("lets keyboard users select a matrix cell", async () => {
  const user = userEvent.setup();
  const select = vi.fn();
  render(<Matrix title="Coverage" rows={["Atlas"]} columns={["Checks"]} cell={() => ({ state: "value", value: 40 })} onSelect={select} />);
  screen.getByRole("button", { name: "Atlas · Checks — 40" }).focus();
  await user.keyboard("{Enter} ");
  expect(select).toHaveBeenCalledTimes(2);
  expect(select).toHaveBeenLastCalledWith("Atlas", "Checks");
});
it("selects graph nodes by keyboard without moving the diagram", async () => {
  const user = userEvent.setup();
  const nodes = [{ id: "a", label: "Atlas" }, { id: "b", label: "Beacon" }];
  const edges = [{ from: "a", to: "b" }];
  function Example() { const [selected, setSelected] = useState<string | null>(null); return <GraphFrame title="Projects" nodes={nodes} edges={edges} width={400} height={260} layout="circular" selected={selected} onSelect={setSelected} />; }
  render(<Example />);
  const node = screen.getByRole("button", { name: "Atlas" });
  const before = node.getAttribute("transform");
  node.focus();
  await user.keyboard("{Enter}");
  expect(node).toHaveAttribute("aria-pressed", "true");
  expect(node).toHaveAttribute("transform", before);
  await user.keyboard(" ");
  expect(node).toHaveAttribute("aria-pressed", "false");
});
it("does not draw dangling graph connections even if a caller pins an unknown id", () => {
  render(<GraphFrame title="Projects" nodes={[{ id: "a" }]} edges={[{ from: "a", to: "ghost" }]} pins={new Map([["ghost", { x: 50, y: 50 }]])} width={300} height={200} layout="circular" />);
  expect(screen.getByRole("img").querySelector("g")!.querySelectorAll("path")).toHaveLength(0);
});
it("keeps color scales finite at small step counts and names the numeric range", () => {
  const { container } = render(<ColourBar steps={1} domain={[-1, 1]} kind="diverging" label="Correlation" />);
  expect(container.innerHTML).not.toContain("NaN");
  expect(screen.getByRole("figure")).toHaveTextContent("Correlation · -1 · 0 · 1");
});
