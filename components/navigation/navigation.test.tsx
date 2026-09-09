import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Breadcrumb, BreadcrumbCurrent, BreadcrumbLink,
  NavLink, Tab, TabPanel, Tabs, TabsList,
} from ".";

describe("NavLink says where you are", () => {
  it("marks the current page, and only when active", () => {
    const { rerender } = render(<NavLink href="/a">Targets</NavLink>);
    expect(screen.getByRole("link")).not.toHaveAttribute("aria-current");
    rerender(<NavLink href="/a" active>Targets</NavLink>);
    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");
  });

  it("does not read the route itself — active is a prop", () => {
    // Nothing to assert about a router because there is none: the component
    // renders identically wherever it is mounted.
    render(<NavLink href="/a" active>Targets</NavLink>);
    expect(screen.getByRole("link", { current: "page" })).toBeInTheDocument();
  });

  it("asChild carries the marking onto the caller's element, with no wrapper", () => {
    const { container } = render(
      <NavLink active asChild><a href="/a" data-testid="l">Targets</a></NavLink>,
    );
    expect(container.querySelectorAll("*")).toHaveLength(1);
    expect(screen.getByTestId("l")).toHaveAttribute("aria-current", "page");
  });
});

describe("Breadcrumb", () => {
  const Subject = () => (
    <Breadcrumb>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
      <BreadcrumbLink href="/targets">Targets</BreadcrumbLink>
      <BreadcrumbCurrent>api.example.com</BreadcrumbCurrent>
    </Breadcrumb>
  );

  it("is a named navigation, because a page has more than one", () => {
    render(<Subject />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("the LAST crumb is not a link — a link to here does nothing", () => {
    render(<Subject />);
    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(screen.getByText("api.example.com").tagName).toBe("SPAN");
    expect(screen.getByText("api.example.com")).toHaveAttribute("aria-current", "page");
  });

  it("separators are real elements, hidden from readers", () => {
    const { container } = render(<Subject />);
    const hidden = [...container.querySelectorAll('[aria-hidden="true"]')];
    expect(hidden).toHaveLength(2);            // between three crumbs
    expect(hidden.every((el) => el.textContent === "/")).toBe(true);
  });

  it("the order is the meaning, so it is an ordered list", () => {
    const { container } = render(<Subject />);
    expect(container.querySelector("ol")).toBeInTheDocument();
  });
});

describe("Tabs", () => {
  const Subject = (props: { activationMode?: "automatic" | "manual" } = {}) => (
    <Tabs defaultValue="one" {...props}>
      <TabsList>
        <Tab value="one">One</Tab>
        <Tab value="two">Two</Tab>
      </TabsList>
      <TabPanel value="one">First panel</TabPanel>
      <TabPanel value="two">Second panel</TabPanel>
    </Tabs>
  );

  it("shows one panel at a time, and the panel is named by its tab", () => {
    render(<Subject />);
    expect(screen.getByRole("tabpanel", { name: "One" })).toHaveTextContent("First panel");
    expect(screen.queryByText("Second panel")).not.toBeInTheDocument();
  });

  it("ONE tab stop for the list, with arrows inside it", async () => {
    const user = userEvent.setup();
    render(<Subject />);
    await user.tab();
    expect(screen.getByRole("tab", { name: "One" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Two" })).toHaveFocus();
    // tabbing again leaves the strip rather than visiting the second tab
    await user.tab();
    expect(screen.getByRole("tab", { name: "Two" })).not.toHaveFocus();
  });

  it("automatic activation shows the panel on arrow — the default", async () => {
    const user = userEvent.setup();
    render(<Subject />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Second panel");
  });

  it("manual moves focus without showing the panel, for when a panel is expensive", async () => {
    const user = userEvent.setup();
    render(<Subject activationMode="manual" />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("First panel");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Second panel");
  });
});
