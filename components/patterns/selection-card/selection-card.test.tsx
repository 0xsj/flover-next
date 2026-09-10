import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { RadioGroup } from "@/components/forms";
import { SelectionCard } from ".";

// Radix measures its hidden form input. Layout is checked in the browser;
// jsdom only needs the observer lifecycle for these label/form assertions.
beforeAll(() => vi.stubGlobal("ResizeObserver", class {
  observe() {}
  unobserve() {}
  disconnect() {}
}));
afterAll(() => vi.unstubAllGlobals());

it("submits one radio value and moves past disabled cards with arrow keys", async () => {
  const user = userEvent.setup();
  render(<form aria-label="Setup"><RadioGroup name="layout" aria-label="Layout" defaultValue="board">
    <SelectionCard mode="single" label="Board" value="board" description="Organize by stage." />
    <SelectionCard mode="single" label="Timeline" value="timeline" disabled description="Not available yet." />
    <SelectionCard mode="single" label="List" value="list" />
  </RadioGroup></form>);
  await user.tab();
  expect(screen.getByRole("radio", { name: "Board" })).toHaveFocus();
  // Roving focus runs after keydown. Keep the key pressed until focus moves,
  // as it would be during a physical key press rather than a synchronous pair.
  await user.keyboard("{ArrowRight>}");
  await waitFor(() => expect(screen.getByRole("radio", { name: "List" })).toBeChecked());
  await user.keyboard("{/ArrowRight}");
  expect(screen.getByRole("radio", { name: "Timeline" })).toBeDisabled();
  expect(new FormData(screen.getByRole("form") as HTMLFormElement).getAll("layout")).toEqual(["list"]);
});

it("labels independent checkbox cards, describes them, and submits repeated values", async () => {
  const user = userEvent.setup();
  render(<form aria-label="Setup">
    <SelectionCard mode="multiple" name="section" label="Activity" value="activity" defaultChecked />
    <SelectionCard mode="multiple" name="section" label="Reports" value="reports" description="Progress summaries." />
    <SelectionCard mode="multiple" name="section" label="Automation" value="automation" disabled />
  </form>);
  await user.click(screen.getByText("Reports"));
  expect(screen.getByRole("checkbox", { name: "Reports" })).toBeChecked();
  expect(screen.getByRole("checkbox", { name: "Reports" })).toHaveAccessibleDescription("Progress summaries.");
  expect(new FormData(screen.getByRole("form") as HTMLFormElement).getAll("section")).toEqual(["activity", "reports"]);
  await user.click(screen.getByText("Automation"));
  expect(screen.getByRole("checkbox", { name: "Automation" })).not.toBeChecked();
  await user.tab();
  expect(screen.getByRole("checkbox", { name: "Automation" })).not.toHaveFocus();
});
