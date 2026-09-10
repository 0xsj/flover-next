import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Progress } from "./progress";

it("keeps unknown progress distinct from a measured zero", () => {
  const { rerender } = render(<Progress label="Import" value={null} />);
  expect(screen.getByRole("progressbar", { name: "Import" })).not.toHaveAttribute("value");
  rerender(<Progress label="Import" value={0} />);
  expect(screen.getByRole("progressbar", { name: "Import" })).toHaveAttribute("value", "0");
  rerender(<Progress label="Import" value={120} max={80} />);
  expect(screen.getByRole("progressbar", { name: "Import" })).toHaveAttribute("value", "80");
  expect(screen.getByRole("progressbar", { name: "Import" })).toHaveAttribute("max", "80");
});
