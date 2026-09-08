import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

/* Ordinary unit tests, not spec tests — no barrier, no custody, no mutation
 * round. See decisions/0001-spec-tests-start-at-business-logic.
 *
 * Every assertion below restates a claim from the CONTRACT half of doc.ts, in
 * the same order. Nothing here asserts anything the mechanics half describes:
 * no test names Slot, cva or a class map.
 *
 * ONE contract claim is not covered here and cannot be. "Button attaches no
 * function the caller did not give it" is invisible to the DOM, because React
 * delegates events rather than emitting an onclick attribute. It is verified
 * instead by the build: app/(dev)/kitchen-sink/_sections/forms.tsx is a server
 * component that renders Buttons, and a component that manufactured a handler
 * would fail to prerender there. Recorded rather than faked. */

describe("the default element and its type", () => {
  it("renders a native button", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" }).tagName).toBe("BUTTON");
  });

  it('defaults type to "button", not the platform\'s "submit"', () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("lets a caller ask for submit", () => {
    render(<Button type="submit">Go</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("does not submit the form it sits in by default", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(<form onSubmit={onSubmit}><Button>Apply</Button></form>);
    await userEvent.setup().click(screen.getByRole("button"));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("inert", () => {
  it("carries no state attributes at all when not inert", () => {
    render(<Button>Go</Button>);
    const b = screen.getByRole("button");
    // Absent, never "false" — [data-disabled] matches the string "false".
    expect(b).not.toHaveAttribute("data-disabled");
    expect(b).not.toHaveAttribute("data-loading");
    expect(b).not.toHaveAttribute("aria-busy");
    expect(b).toBeEnabled();
  });

  it("disabled sets the native attribute and data-disabled", () => {
    render(<Button disabled>Go</Button>);
    const b = screen.getByRole("button");
    expect(b).toBeDisabled();
    expect(b).toHaveAttribute("data-disabled", "true");
  });

  it("loading is inert too, and announces itself separately", () => {
    render(<Button loading>Saving</Button>);
    const b = screen.getByRole("button", { name: "Saving" });
    expect(b).toBeDisabled();
    expect(b).toHaveAttribute("data-disabled", "true");
    expect(b).toHaveAttribute("data-loading", "true");
    expect(b).toHaveAttribute("aria-busy", "true");
  });

  it("keeps the label while loading, and hides the indicator from readers", () => {
    render(<Button loading>Saving</Button>);
    // The accessible name is still the label: the indicator contributes nothing.
    const b = screen.getByRole("button", { name: "Saving" });
    expect(b).toHaveTextContent("Saving");
    expect(b.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("handlers", () => {
  it("calls a caller's handler when not inert", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.setup().click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call it when disabled", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Go</Button>);
    await userEvent.setup().click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not call it when loading", async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Saving</Button>);
    await userEvent.setup().click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("asChild", () => {
  it("renders exactly one element — the caller's — and no wrapper", () => {
    const { container } = render(
      <Button asChild><a href="#x">Go</a></Button>,
    );
    expect(screen.getByRole("link", { name: "Go" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.querySelectorAll("*")).toHaveLength(1);
  });

  it("merges className rather than replacing it", () => {
    render(<Button asChild><a href="#x" className="mine">Go</a></Button>);
    const a = screen.getByRole("link");
    expect(a.className).toContain("mine");
    expect(a.className.split(/\s+/).length).toBeGreaterThan(1);
  });

  it("composes handlers, the caller's first", async () => {
    const order: string[] = [];
    render(
      <Button asChild onClick={() => order.push("button")}>
        <a href="#x" onClick={() => order.push("child")}>Go</a>
      </Button>,
    );
    await userEvent.setup().click(screen.getByRole("link"));
    expect(order).toEqual(["child", "button"]);
  });

  it("mitigates inert without the native attribute, which means nothing here", () => {
    render(<Button asChild disabled><a href="#x">Go</a></Button>);
    const a = screen.getByRole("link");
    expect(a).not.toHaveAttribute("disabled");
    expect(a).toHaveAttribute("aria-disabled", "true");
    expect(a).toHaveAttribute("tabindex", "-1");
    expect(a).toHaveAttribute("data-disabled", "true");
  });

  it("renders the busy indicator inside the caller's element", () => {
    render(<Button asChild loading><a href="#x">Go</a></Button>);
    expect(screen.getByRole("link").querySelector("svg")).not.toBeNull();
  });
});

describe("class names and defaults", () => {
  it("adds a caller's className to its own rather than replacing them", () => {
    render(<Button className="mine">Go</Button>);
    const b = screen.getByRole("button");
    expect(b.className).toContain("mine");
    expect(b.className.split(/\s+/).length).toBeGreaterThan(1);
  });
});

describe('size="icon"', () => {
  it("has an accessible name from the required label", () => {
    render(<Button size="icon" aria-label="Add">+</Button>);
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });
});
