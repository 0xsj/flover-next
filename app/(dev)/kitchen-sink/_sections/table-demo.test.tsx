import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { TableDemo } from "./table-demo";

it("sorts the whole collection before paging and exposes its sort direction", async () => {
  const user = userEvent.setup();
  render(<TableDemo />);
  await user.click(screen.getByRole("button", { name: "Members" }));
  expect(screen.getByRole("columnheader", { name: "Members" })).toHaveAttribute("aria-sort", "ascending");
  const table = screen.getByRole("table");
  expect(within(table).getAllByRole("rowheader").map((item) => item.textContent)).toEqual(["Drift", "Grove", "Canvas", "Folio", "Members on this page"]);
  await user.click(screen.getByRole("button", { name: "Next page" }));
  expect(within(table).getAllByRole("rowheader")[0]).toHaveTextContent("Echo");
  await user.click(screen.getByRole("button", { name: "Members" }));
  expect(within(table).getAllByRole("rowheader")[0]).toHaveTextContent("Beacon");
  expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
});
it("retains selection across pages and reports partial page selection", async () => {
  const user = userEvent.setup();
  render(<TableDemo />);
  await user.click(screen.getByRole("checkbox", { name: "Select Atlas" }));
  expect(screen.getByRole("checkbox", { name: "Select projects on this page" })).toHaveAttribute("aria-checked", "mixed");
  await user.click(screen.getByRole("button", { name: "Next page" }));
  await user.click(screen.getByRole("checkbox", { name: "Select projects on this page" }));
  expect(screen.getByRole("status")).toHaveTextContent("5 selected");
  await user.click(screen.getByRole("button", { name: "Previous page" }));
  expect(screen.getByRole("checkbox", { name: "Select Atlas" })).toBeChecked();
  await user.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(screen.getByRole("status")).toHaveTextContent("0 selected");
});
it("resets paging when filtering, and recovers from an empty result", async () => {
  const user = userEvent.setup();
  render(<TableDemo />);
  await user.click(screen.getByRole("button", { name: "Next page" }));
  await user.type(screen.getByRole("searchbox", { name: "Search projects" }), "ada");
  expect(screen.getByRole("status")).toHaveTextContent("2 projects");
  expect(screen.getByRole("rowheader", { name: "Atlas" })).toBeVisible();
  expect(screen.queryByRole("navigation", { name: "Project pages" })).not.toBeInTheDocument();
  await user.type(screen.getByRole("searchbox"), "no-match");
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  expect(screen.getByText("No matching projects")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Clear search" }));
  expect(screen.getByRole("status")).toHaveTextContent("8 projects");
  expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
});
