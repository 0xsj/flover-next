import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Box, Container, Flex, Separator, spaceStyle, splitSpace } from ".";

describe("space props resolve to tokens, never to numbers", () => {
  it("a step becomes a var() reference on the existing scale", () => {
    expect(spaceStyle({ p: 3 }).padding).toBe("var(--space-3)");
    expect(spaceStyle({ px: 5 }).paddingInline).toBe("var(--space-5)");
  });

  it("zero is a literal, because the scale starts at 1", () => {
    expect(spaceStyle({ p: 0 }).padding).toBe("0");
  });

  it("auto is allowed on a margin and not on a padding", () => {
    expect(spaceStyle({ mx: "auto" }).marginInline).toBe("auto");
  });

  it("an absent prop emits nothing at all", () => {
    const style = spaceStyle({});
    expect(Object.values(style).every((v) => v === undefined)).toBe(true);
  });

  it("edges are LOGICAL, so they follow the text direction", () => {
    const style = spaceStyle({ pt: 2, pb: 3, pl: 4, pr: 5 });
    expect(style.paddingBlockStart).toBe("var(--space-2)");
    expect(style.paddingBlockEnd).toBe("var(--space-3)");
    expect(style.paddingInlineStart).toBe("var(--space-4)");
    expect(style.paddingInlineEnd).toBe("var(--space-5)");
  });
});

describe("splitSpace keeps the DOM clean", () => {
  it("strips every space prop from what is spread onto an element", () => {
    const [, rest] = splitSpace({ p: 2, gap: 1, id: "x", role: "note" } as never);
    expect(rest).toEqual({ id: "x", role: "note" });
  });

  it("so no unknown attribute reaches the DOM", () => {
    render(<Box p={3} gap={2} data-testid="b">x</Box>);
    const el = screen.getByTestId("b");
    expect(el).not.toHaveAttribute("p");
    expect(el).not.toHaveAttribute("gap");
    expect(el.style.padding).toBe("var(--space-3)");
  });
});

describe("Box", () => {
  it("has no appearance of its own", () => {
    render(<Box data-testid="b">x</Box>);
    expect(screen.getByTestId("b").className).toBe("");
  });

  it("asChild renders the caller's element and adds no wrapper", () => {
    const { container } = render(
      <Box p={2} asChild><section data-testid="s">x</section></Box>,
    );
    expect(container.querySelectorAll("*")).toHaveLength(1);
    expect(screen.getByTestId("s").tagName).toBe("SECTION");
    expect(screen.getByTestId("s").style.padding).toBe("var(--space-2)");
  });

  it("a caller's own style wins over the spacing props", () => {
    render(<Box p={3} style={{ padding: "7px" }} data-testid="b">x</Box>);
    expect(screen.getByTestId("b").style.padding).toBe("7px");
  });
});

describe("Flex", () => {
  it("sets the display and passes the arrangement through", () => {
    render(<Flex direction="column" align="center" justify="space-between" gap={4} data-testid="f">x</Flex>);
    const el = screen.getByTestId("f");
    expect(el.style.display).toBe("flex");
    expect(el.style.flexDirection).toBe("column");
    expect(el.style.alignItems).toBe("center");
    expect(el.style.gap).toBe("var(--space-4)");
  });

  it("grow also sets min-inline-size: 0 — the commonest flex defect", () => {
    render(<Flex grow data-testid="f">x</Flex>);
    const el = screen.getByTestId("f");
    expect(el.style.flexGrow).toBe("1");
    expect(el.style.flexBasis).toBe("0px");
    expect(el.style.minInlineSize).toBe("0px");
  });

  it("without grow it does neither", () => {
    render(<Flex data-testid="f">x</Flex>);
    expect(screen.getByTestId("f").style.minInlineSize).toBe("");
  });
});

describe("Container and Separator", () => {
  it("a container centres and caps", () => {
    render(<Container data-testid="c">x</Container>);
    expect(screen.getByTestId("c").className).not.toBe("");
  });

  it("is announced by default — the primitive's default, kept rather than inverted", () => {
    render(<Separator />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("and silent when it is only visual grouping", () => {
    render(<Separator decorative />);
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });

  it("orientation is reported, not only styled", () => {
    render(<Separator orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });
});
