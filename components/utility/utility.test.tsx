import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AccessibleIcon, Check, Portal, VisuallyHidden } from ".";

/* What is asserted here, and what is not.
 *
 * The hiding IS asserted, because the primitive sets inline styles and an
 * inline style is in the DOM whether or not anything renders CSS. That is not
 * true of the rest of this design system, and the reason is worth writing down:
 *
 *   MEASURED, jsdom 30 · vitest 5. With `css: true` a plain CSS-Modules rule
 *   applies and `getComputedStyle` reports it — but every rule inside
 *   `@layer …` is dropped, silently, with no error. Every stylesheet in this
 *   project is layered, so a style assertion against a class here would pass
 *   for a class that does nothing and fail for one that works.
 *
 * So the suite asserts the accessibility tree, which is where these components
 * do their work, and asserts appearance only where it is inline. */

describe("VisuallyHidden", () => {
  it("stays in the accessibility tree — that is the whole point", () => {
    render(<VisuallyHidden>Sorting ascending</VisuallyHidden>);
    const el = screen.getByText("Sorting ascending");
    expect(el).not.toHaveAttribute("aria-hidden");
    expect(el).toBeVisible(); // `display:none` and `hidden` would both fail here
  });

  it("is clipped out of the layout rather than removed from it", () => {
    render(<VisuallyHidden>Sorting ascending</VisuallyHidden>);
    const { style } = screen.getByText("Sorting ascending");
    expect(style.position).toBe("absolute");
    expect(style.width).toBe("1px");
    expect(style.height).toBe("1px");
    expect(style.overflow).toBe("hidden");
    expect(style.whiteSpace).toBe("nowrap");
  });

  it("and a plain span has none of that", () => {
    // The negative control. Without it the block above passes against any
    // element that happens to carry an empty style attribute.
    render(<span data-testid="plain">Sorting ascending</span>);
    expect(screen.getByTestId("plain").style.position).toBe("");
  });

  it("asChild hides the caller's own element and adds no wrapper", () => {
    const { container } = render(
      <VisuallyHidden asChild><h2 data-testid="h">Filters</h2></VisuallyHidden>,
    );
    expect(container.querySelectorAll("*")).toHaveLength(1);
    expect(screen.getByTestId("h").tagName).toBe("H2");
    expect(screen.getByTestId("h").style.position).toBe("absolute");
  });

  it("a caller's own style wins, which is the one way to unhide it by accident", () => {
    render(<VisuallyHidden style={{ position: "static" }}>oops</VisuallyHidden>);
    expect(screen.getByText("oops").style.position).toBe("static");
  });
});

describe("AccessibleIcon", () => {
  /* A real icon from the re-export file, not a stand-in.
   *
   * The primitive CLONES its child to add the two attributes, so the child has
   * to forward props to the element it renders. `() => <svg/>` looks like an
   * icon and silently swallows them — the label is announced and the graphic is
   * announced too, which is the defect this component exists to prevent. */
  const Glyph = (props: Record<string, unknown>) => <Check {...props} />;

  it("names the control it sits in", async () => {
    render(
      <button type="button">
        <AccessibleIcon label="Delete target"><Glyph /></AccessibleIcon>
      </button>,
    );
    // The accessible NAME, computed from the tree — not the presence of a span.
    expect(screen.getByRole("button", { name: "Delete target" })).toBeInTheDocument();
  });

  it("and without it the same button has no name at all", () => {
    // The self-test. If the query above could pass either way it is asserting
    // that a button exists, which nobody needed to know.
    render(<button type="button"><Glyph /></button>);
    expect(screen.queryByRole("button", { name: "Delete target" })).toBeNull();
    expect(screen.getByRole("button")).toHaveAccessibleName("");
  });

  it("hides the icon from the tree and from tab order", () => {
    const { container } = render(
      <AccessibleIcon label="Delete target"><Glyph /></AccessibleIcon>,
    );
    const glyph = container.querySelector("svg")!;
    expect(glyph).toHaveAttribute("aria-hidden", "true");
    // An SVG can take focus without this; `aria-hidden` alone does not stop it.
    expect(glyph).toHaveAttribute("focusable", "false");
  });

  it("adds no wrapper element around the icon", () => {
    const { container } = render(
      <AccessibleIcon label="Delete target"><Glyph /></AccessibleIcon>,
    );
    expect(container.firstElementChild?.tagName).toBe("svg");
  });
});

describe("Portal", () => {
  it("renders into document.body, outside the tree it was written in", () => {
    const { container } = render(<Portal><span data-testid="p">over here</span></Portal>);
    const el = screen.getByTestId("p");
    expect(container.contains(el)).toBe(false);
    expect(document.body.contains(el)).toBe(true);
  });

  it("honours an explicit container", () => {
    const host = document.createElement("div");
    document.body.append(host);
    render(<Portal container={host}><span data-testid="p">over here</span></Portal>);
    expect(host.contains(screen.getByTestId("p"))).toBe(true);
    host.remove();
  });

  it("a React event still bubbles to the component that rendered it", async () => {
    // The two-trees fact, and the one that surprises people. The DOM parent is
    // body; the React parent is this div, and React events follow the React
    // tree — so a handler here fires for a click that is not a DOM descendant.
    const onClick = vi.fn();
    render(
      <div onClick={onClick}>
        <Portal><button type="button">inside</button></Portal>
      </div>,
    );
    await userEvent.click(screen.getByRole("button", { name: "inside" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders nothing on the server", () => {
    // So nothing in the first paint, and nothing indexable, may live in one.
    expect(renderToStaticMarkup(<Portal><span>invisible</span></Portal>)).toBe("");
  });
});

/* The icon re-export file is the only importer of the icon library.
 *
 * CLAUDE.md states it; until this group landed nothing checked it, and an
 * import inside a component is exactly the kind of line that arrives without
 * anyone noticing. Once there are two importers the export list stops being the
 * inventory of icons in use and becomes a guess. */
describe("only one file imports the icon library", () => {
  const IMPORTS_LUCIDE = /from\s+["']lucide-react["']/;
  const ALLOWED = path.join("components", "utility", "icon", "icon.ts");

  async function* walk(dir: string): AsyncGenerator<string> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === "node_modules" || e.name.startsWith(".")) continue;
        yield* walk(full);
      } else if (/\.tsx?$/.test(e.name)) {
        yield full;
      }
    }
  }

  async function importers(): Promise<string[]> {
    const found: string[] = [];
    for (const root of ["app", "components", "lib", "drafts"]) {
      for await (const file of walk(path.join(process.cwd(), root))) {
        if (IMPORTS_LUCIDE.test(await readFile(file, "utf8"))) {
          found.push(path.relative(process.cwd(), file));
        }
      }
    }
    return found;
  }

  it("and it is components/utility/icon/icon.ts", async () => {
    expect(await importers(), "re-export it from icon.ts instead").toEqual([ALLOWED]);
  });

  it("the check can see a violation", () => {
    // Assembled, so this line does not itself become an offender — excluding
    // test files would be the other fix and would put them outside the rule.
    const violation = `import { Plus } from "lucide` + `-react";`;
    expect(IMPORTS_LUCIDE.test(violation)).toBe(true);
    expect(IMPORTS_LUCIDE.test('import { Plus } from "@/components/utility";')).toBe(false);
  });
});
