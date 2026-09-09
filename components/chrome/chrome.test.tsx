import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { DensityToggle, Mark, MARK, ThemeToggle } from ".";

/* These are the only components in the system that write to the document and to
 * storage, so every test here has to put both back. */
afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.density;
});

describe("ThemeToggle", () => {
  it("offers three choices, because system is one of them", () => {
    render(<ThemeToggle />);
    const group = screen.getByRole("radiogroup", { name: "Theme" });
    expect(within(group).getAllByRole("radio")).toHaveLength(3);
  });

  it("is a single-select and not three independent toggles", () => {
    // The defect in the control this replaced. `aria-pressed` on three buttons
    // announces three decisions; exactly one radio is checked announces one.
    render(<ThemeToggle />);
    const radios = screen.getAllByRole("radio");
    expect(radios.filter((r) => r.getAttribute("aria-checked") === "true")).toHaveLength(1);
    expect(radios.some((r) => r.hasAttribute("aria-pressed"))).toBe(false);
  });

  it("starts on system, which is what the server rendered", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
  });

  it("choosing dark sets the attribute the token layer reads", async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("radio", { name: "Dark" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("choosing system REMOVES it, rather than setting a third value", async () => {
    // The media query in the token layer only takes over when the attribute is
    // absent. `data-theme="system"` would match nothing and silently pin light.
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("radio", { name: "Dark" }));
    await userEvent.click(screen.getByRole("radio", { name: "System" }));
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("persists the choice", async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("radio", { name: "Light" }));
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("hydrates itself from storage, without a shell setting it up", async () => {
    localStorage.setItem("theme", "dark");
    render(<ThemeToggle />);
    // After mount, not during render — the server has no storage to read.
    expect(await screen.findByRole("radio", { name: "Dark", checked: true })).toBeInTheDocument();
  });

  it("one Tab stop, and arrows move within the group", async () => {
    // Three options, one stop. The row of buttons this replaced was three.
    render(<ThemeToggle />);
    await userEvent.tab();
    expect(screen.getByRole("radio", { name: "System" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Light" })).toHaveFocus();
  });

  it("arrowing moves focus WITHOUT applying — Space commits", async () => {
    /* Measured here, and the opposite of what the primitive intends: its
       selection-follows-focus is driven by a document-level keydown listener
       that runs after the roving focus has already moved, so the focus lands
       unchecked. Whether a real browser orders those two the same way is not
       settled by this suite — what is settled is that arrowing past an option
       does not apply it, so the suite pins the safe half.

       Either way the design has to survive it: a focused-but-unchecked option
       needs a focus ring distinct from the checked fill, which the reset's
       `:focus-visible` outline provides. */
    render(<ThemeToggle />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);

    await userEvent.keyboard(" ");
    expect(screen.getByRole("radio", { name: "Light" })).toBeChecked();
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});

describe("DensityToggle", () => {
  it("is named, so it is not announced as an unlabelled radio group", () => {
    render(<DensityToggle />);
    expect(screen.getByRole("radiogroup", { name: "Density" })).toBeInTheDocument();
  });

  it("compact sets the attribute; comfortable removes it", async () => {
    render(<DensityToggle />);
    await userEvent.click(screen.getByRole("radio", { name: "Compact" }));
    expect(document.documentElement.dataset.density).toBe("compact");
    await userEvent.click(screen.getByRole("radio", { name: "Comfortable" }));
    expect(document.documentElement.hasAttribute("data-density")).toBe(false);
  });

  it("does not touch the theme", async () => {
    render(<><ThemeToggle /><DensityToggle /></>);
    await userEvent.click(screen.getByRole("radio", { name: "Dark" }));
    await userEvent.click(screen.getByRole("radio", { name: "Compact" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});

describe("Mark", () => {
  it("spells the name in one place", () => {
    render(<Mark />);
    expect(screen.getByText(MARK)).toBeInTheDocument();
  });

  it("is a span by default — a header lockup is not a heading", () => {
    render(<Mark />);
    expect(screen.getByText(MARK).tagName).toBe("SPAN");
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("becomes the heading when the caller says it is one", () => {
    render(<Mark as="h1" size="display" />);
    expect(screen.getByRole("heading", { level: 1, name: MARK })).toBeInTheDocument();
  });
});
