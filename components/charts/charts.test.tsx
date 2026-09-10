import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { BarChart, ChartFrame, LineChart, type ChartSeries } from ".";

const series: readonly ChartSeries[] = [{ key: "count", label: "Count" }];
it("keeps zero, absent, and invalid bar values distinct", () => {
  render(<BarChart label="Counts" data={[{ label: "Measured", value: 0 }, { label: "Missing", value: null }, { label: "Negative", value: -1 }, { label: "Invalid", value: Infinity }]} />);
  expect(screen.getByText("0")).toBeVisible();
  expect(screen.getAllByText("Unavailable")).toHaveLength(3);
});
it("does not round a small measurement into a zero in its text values", async () => {
  const user = userEvent.setup();
  render(<><BarChart label="Small amount" data={[{ label: "Measured", value: 0.000001 }]} /><LineChart label="Precise readings" series={series} data={[{ label: "Today", values: { count: 0.000001 } }]} /></>);
  expect(within(screen.getByRole("region", { name: "Small amount" })).getByText("0.000001")).toBeVisible();
  await user.click(screen.getByText("View data for Precise readings"));
  expect(within(screen.getByRole("table")).getByRole("cell", { name: "0.000001" })).toBeVisible();
});
it("exposes exact line values as a labelled table, including zero and negative amounts", async () => {
  const user = userEvent.setup();
  render(<LineChart label="Net change" series={series} data={[{ label: "Mon", values: { count: 0 } }, { label: "Tue", values: { count: -4 } }, { label: "Wed", values: { count: null } }]} />);
  expect(screen.getByRole("img", { name: /Net change/ })).toBeVisible();
  await user.click(screen.getByText("View data for Net change"));
  const table = screen.getByRole("table", { name: "Net change" });
  expect(within(table).getByRole("cell", { name: "0" })).toBeVisible();
  expect(within(table).getByRole("cell", { name: "-4" })).toBeVisible();
  expect(within(table).getByRole("cell", { name: "Unavailable" })).toBeVisible();
});
it("breaks a plotted line at missing values instead of connecting across them", () => {
  render(<LineChart label="Gaps" series={series} data={[{ label: "A", values: { count: 2 } }, { label: "B", values: { count: null } }, { label: "C", values: { count: 5 } }]} />);
  const plot = screen.getByRole("img");
  // The geometry is the promise here: two move commands and no connecting line.
  const path = plot.querySelector("path")!.getAttribute("d")!;
  expect(path.match(/M/g)).toHaveLength(2);
  expect(path).not.toContain("L");
  expect(plot.querySelectorAll("circle")).toHaveLength(2);
});
it.each([[0], [4, 4, 4], [-4, 4], [-1e308, 1e308]])("plots finite coordinates for %j", (...values) => {
  const data = values.map((value, index) => ({ label: String(index), values: { count: value } }));
  render(<LineChart label="Edge values" series={series} data={data} />);
  const plot = screen.getByRole("img");
  expect(plot.outerHTML).not.toMatch(/NaN|Infinity/);
  expect(plot.querySelectorAll("circle")).toHaveLength(values.length);
});
it("names empty data and accepts arbitrary content in a chart frame", () => {
  render(<ChartFrame title="Queue"><BarChart label="Queue" data={[]} /></ChartFrame>);
  expect(screen.getByRole("figure")).toHaveTextContent("Queue");
  expect(screen.getByText("No measurements to display.")).toBeVisible();
});
it("reports unavailable measurements without drawing an invented numeric axis", async () => {
  const user = userEvent.setup();
  render(<LineChart label="Pending readings" series={series} data={[{ label: "Mon", values: { count: null } }, { label: "Tue", values: { count: NaN } }]} />);
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.getByText("Measurements unavailable.")).toBeVisible();
  await user.click(screen.getByText("View data for Pending readings"));
  expect(within(screen.getByRole("table")).getAllByRole("cell", { name: "Unavailable" })).toHaveLength(2);
});
