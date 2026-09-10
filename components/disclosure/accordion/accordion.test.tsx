import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion";

const items = <>
  <AccordionItem value="first"><AccordionTrigger>First</AccordionTrigger><AccordionContent>First content</AccordionContent></AccordionItem>
  <AccordionItem value="disabled" disabled><AccordionTrigger>Unavailable</AccordionTrigger><AccordionContent>Unavailable content</AccordionContent></AccordionItem>
  <AccordionItem value="last"><AccordionTrigger>Last</AccordionTrigger><AccordionContent>Last content</AccordionContent></AccordionItem>
</>;
it("supports keyboard movement, skips disabled items, and collapses a single selection", async () => {
  const user = userEvent.setup();
  render(<Accordion type="single" collapsible defaultValue="first">{items}</Accordion>);
  const first = screen.getByRole("button", { name: "First" });
  const last = screen.getByRole("button", { name: "Last" });
  expect(first).toHaveAttribute("aria-expanded", "true");
  first.focus();
  await user.keyboard("{ArrowDown}");
  expect(last).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(last).toHaveAttribute("aria-expanded", "true");
  expect(first).toHaveAttribute("aria-expanded", "false");
  await user.keyboard("{Enter}");
  expect(last).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByRole("button", { name: "Unavailable" })).toBeDisabled();
});
it("allows independent open items in multiple mode", async () => {
  const user = userEvent.setup();
  render(<Accordion type="multiple">{items}</Accordion>);
  await user.click(screen.getByRole("button", { name: "First" }));
  await user.click(screen.getByRole("button", { name: "Last" }));
  expect(screen.getByText("First content")).toBeVisible();
  expect(screen.getByText("Last content")).toBeVisible();
});
