import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { Slider } from "./slider";

// jsdom has no layout. Radix observes thumb size for pointer positioning; these
// tests cover numeric keyboard behavior. Actual layout is checked in a browser.
beforeAll(() => vi.stubGlobal("ResizeObserver", class {
  observe() {}
  unobserve() {}
  disconnect() {}
}));
afterAll(() => vi.unstubAllGlobals());

it("uses numeric controlled values and respects step and keyboard bounds", async () => {
  const commit = vi.fn();
  const user = userEvent.setup();
  function Example() { const [value, setValue] = useState(20); return <Slider label="Interval" value={value} onValueChange={setValue} onValueCommit={commit} min={10} max={30} step={5} />; }
  render(<Example />);
  const slider = screen.getByRole("slider", { name: "Interval" });
  slider.focus();
  await user.keyboard("{ArrowRight}");
  expect(slider).toHaveAttribute("aria-valuenow", "25");
  expect(commit).toHaveBeenLastCalledWith(25);
  await user.keyboard("{End}{ArrowRight}");
  expect(slider).toHaveAttribute("aria-valuenow", "30");
  await user.keyboard("{Home}{ArrowLeft}");
  expect(slider).toHaveAttribute("aria-valuenow", "10");
});
it("takes an uncontrolled default and removes a disabled thumb from tab order", () => {
  render(<Slider label="Unavailable" defaultValue={40} disabled />);
  const slider = screen.getByRole("slider", { name: "Unavailable" });
  expect(slider).toHaveAttribute("aria-valuenow", "40");
  expect(slider).not.toHaveAttribute("tabindex", "0");
});
