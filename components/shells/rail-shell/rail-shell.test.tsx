import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { NavigationRail, RailLink, ContextSidebar, RailShell } from "..";

const rail = <NavigationRail><RailLink href="/work" label="Work" active><span aria-hidden="true">W</span></RailLink><RailLink href="/settings" label="Settings"><span aria-hidden="true">S</span></RailLink></NavigationRail>;
const sidebar = <ContextSidebar title="Work"><nav aria-label="Work pages"><a href="/work/projects">Projects</a></nav></ContextSidebar>;

it("keeps one main landmark and marks the active section independently of its page", () => {
  render(<RailShell rail={rail} sidebar={sidebar}><h1>Projects</h1></RailShell>);
  expect(screen.getAllByRole("main")).toHaveLength(1);
  expect(within(screen.getByRole("main")).getByRole("heading", { name: "Projects" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "true");
  expect(screen.getByRole("link", { name: "Settings" })).not.toHaveAttribute("aria-current");
  expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", `#${screen.getByRole("main").id}`);
});
it("removes collapsed context navigation from focus while retaining the rail", async () => {
  const user = userEvent.setup();
  render(<RailShell rail={rail} sidebar={sidebar}>content</RailShell>);
  const toggle = screen.getByRole("button", { name: "Hide section navigation" });
  const controlled = toggle.getAttribute("aria-controls")!;
  await user.click(toggle);
  expect(screen.queryByRole("navigation", { name: "Work pages" })).toBeNull();
  expect(document.getElementById(controlled)).toHaveAttribute("hidden");
  expect(screen.getByRole("link", { name: "Work" })).toBeVisible();
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  await user.click(toggle);
  expect(screen.getByRole("link", { name: "Projects" })).toBeVisible();
});
it("allows callers to own sidebar state", async () => {
  const user = userEvent.setup();
  function Example() { const [open, setOpen] = useState(false); return <RailShell rail={rail} sidebar={sidebar} sidebarOpen={open} onSidebarOpenChange={setOpen}>content</RailShell>; }
  render(<Example />);
  expect(screen.queryByRole("navigation", { name: "Work pages" })).toBeNull();
  await user.click(screen.getByRole("button", { name: "Show section navigation" }));
  expect(screen.getByRole("navigation", { name: "Work pages" })).toBeVisible();
});
