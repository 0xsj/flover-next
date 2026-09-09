import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell, AuthShell, SidebarNav, type NavGroup } from ".";

const groups: NavGroup[] = [
  { items: [{ href: "/app", label: "Overview" }] },
  { label: "Reference", items: [{ href: "/kitchen-sink", label: "Kitchen sink" }] },
];

describe("AppShell", () => {
  it("owns the one main landmark", () => {
    // A screen that renders its own inside this one gives the page two, and the
    // jump a reader makes to reach content stops meaning anything.
    render(<AppShell nav={<nav aria-label="Sections" />}>content</AppShell>);
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("puts the screen's content inside it, not beside it", () => {
    render(<AppShell nav={<nav aria-label="Sections" />}><p>the screen</p></AppShell>);
    expect(within(screen.getByRole("main")).getByText("the screen")).toBeInTheDocument();
  });

  it("renders the nav and the actions it was handed", () => {
    render(
      <AppShell nav={<nav aria-label="Sections">links</nav>} actions={<button type="button">Account</button>}>
        content
      </AppShell>,
    );
    expect(screen.getByRole("navigation", { name: "Sections" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Account" })).toBeInTheDocument();
  });

  it("shows the wordmark, and lets a product replace it", () => {
    const { rerender } = render(<AppShell nav={<nav aria-label="s" />}>c</AppShell>);
    expect(screen.getByText("flover")).toBeInTheDocument();
    rerender(<AppShell nav={<nav aria-label="s" />} brand={<span>Acme</span>}>c</AppShell>);
    expect(screen.queryByText("flover")).toBeNull();
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });
});

describe("AuthShell", () => {
  it("the title is the page's heading, not the wordmark", () => {
    // A sign-in page whose only heading is a logo gives a reader arriving by
    // keyboard nothing to orient on.
    render(<AuthShell title="Sign in">form</AuthShell>);
    expect(screen.getByRole("heading", { level: 1, name: "Sign in" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading")).toHaveLength(1);
  });

  it("renders the description and footer when given, and neither when not", () => {
    const { rerender } = render(
      <AuthShell title="Sign in" description="Use your email." footer={<a href="/sign-up">Create one</a>}>
        form
      </AuthShell>,
    );
    expect(screen.getByText("Use your email.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create one" })).toBeInTheDocument();

    rerender(<AuthShell title="Sign in">form</AuthShell>);
    expect(screen.queryByRole("link")).toBeNull();
  });
});

describe("SidebarNav", () => {
  it("marks the current page for a reader, not only in colour", () => {
    render(<SidebarNav groups={groups} current="/app" />);
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Kitchen sink" })).not.toHaveAttribute("aria-current");
  });

  it("a nested route still marks the section it belongs to", () => {
    render(<SidebarNav groups={groups} current="/kitchen-sink/tokens" />);
    expect(screen.getByRole("link", { name: "Kitchen sink" })).toHaveAttribute("aria-current", "page");
  });

  it("but a prefix that is not a path segment does not count", () => {
    // `/app` must not light up for `/apples`.
    render(<SidebarNav groups={[{ items: [{ href: "/app", label: "Overview" }] }]} current="/apples" />);
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current");
  });

  it("root is exempt, or it would be current everywhere", () => {
    render(<SidebarNav groups={[{ items: [{ href: "/", label: "Home" }] }]} current="/app" />);
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  it("nothing is current when the caller does not know where it is", () => {
    render(<SidebarNav groups={groups} />);
    expect(screen.queryByRole("link", { current: "page" })).toBeNull();
  });

  it("one landmark for the whole sidebar, and it is named", () => {
    // Groups are headed lists inside it. Nested landmarks are a reader's
    // problem, not a structure.
    render(<SidebarNav groups={groups} label="Application" />);
    expect(screen.getAllByRole("navigation")).toHaveLength(1);
    expect(screen.getByRole("navigation", { name: "Application" })).toBeInTheDocument();
    expect(screen.getByText("Reference")).toBeInTheDocument();
  });
});
