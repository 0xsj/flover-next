import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Presence as PresenceValue } from "@/lib/kernel";
import { Avatar, Badge, Empty, Mock, Panel, Presence, Stat, Table, TBody, Td, Th, THead, Tr } from ".";

/* The assertions worth having here are all the same shape: that two things
 * which look similar stay distinguishable. */

describe("Presence keeps three states apart", () => {
  const render$ = (of: PresenceValue<string>) =>
    render(<Presence of={of}>{(v) => <span>{v}</span>}</Presence>);

  it("found renders its value", () => {
    render$({ state: "found", value: "api.example.com" });
    expect(screen.getByText("api.example.com")).toBeInTheDocument();
  });

  it("empty and unmeasured render DIFFERENTLY — the whole point", () => {
    const { container: a } = render$({ state: "empty" });
    const { container: b } = render$({
      state: "unmeasured",
      failure: { kind: "timeout", message: "slow" },
    });
    expect(a.textContent).not.toBe(b.textContent);
    expect(a.textContent).toBe("none");
    expect(b.textContent).toBe("–");
  });

  it("each absent state says which one it is", () => {
    render$({ state: "empty" });
    expect(screen.getByTitle(/looked, and found nothing/)).toBeInTheDocument();
    render$({ state: "unmeasured", failure: { kind: "timeout", message: "s" } });
    expect(screen.getByTitle(/never checked/)).toBeInTheDocument();
  });
});

describe("Stat: an unmeasured total is not zero", () => {
  it("renders a dash for undefined, never 0", () => {
    render(<Stat label="Targets" />);
    expect(screen.getByText("–")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("renders a real zero when zero was measured", () => {
    render(<Stat label="Targets" value={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("and the two are visibly different", () => {
    const { container: a } = render(<Stat label="T" />);
    const { container: b } = render(<Stat label="T" value={0} />);
    expect(a.textContent).not.toBe(b.textContent);
  });
});

describe("Badge is never colour alone", () => {
  it("carries a glyph beside the colour, hidden from readers", () => {
    const { container } = render(<Badge tone="crit" glyph="✕">Failed</Badge>);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent("✕");
    // the text is the announcement, and it survives without the glyph
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});

describe("Mock is announced, not decorative", () => {
  it("carries a role so a reader learns this is not a record", () => {
    render(<Mock />);
    expect(screen.getByRole("note")).toHaveTextContent(/none of this is a record/i);
  });
});

describe("Avatar identifies somebody even without an image", () => {
  it("falls back to initials, with the name still available to a reader", () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByText("AL")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("uses the name as the image's alternative text", () => {
    render(<Avatar name="Ada Lovelace" src="/a.png" />);
    expect(screen.getByAltText("Ada Lovelace")).toBeInTheDocument();
  });
});

describe("Table", () => {
  it("headers carry a scope, so a reader can tell column from row", () => {
    render(
      <Table caption="Targets">
        <THead><Tr><Th>Name</Th><Th numeric>Findings</Th></Tr></THead>
        <TBody><Tr><Td>api</Td><Td numeric>3</Td></Tr></TBody>
      </Table>,
    );
    for (const h of screen.getAllByRole("columnheader")) {
      expect(h).toHaveAttribute("scope", "col");
    }
    expect(screen.getByRole("table", { name: "Targets" })).toBeInTheDocument();
  });

  it("a cell can hold a Presence, which is the reason it is compositional", () => {
    render(
      <Table>
        <TBody><Tr><Td><Presence of={{ state: "empty" }}>{(v: string) => v}</Presence></Td></Tr></TBody>
      </Table>,
    );
    expect(screen.getByText("none")).toBeInTheDocument();
  });
});

describe("Panel and Empty", () => {
  it("a panel names its region", () => {
    render(<Panel title="Targets">body</Panel>);
    expect(screen.getByRole("heading", { name: "Targets" })).toBeInTheDocument();
  });

  it("an empty state says what is absent, not 'no data'", () => {
    render(<Empty title="No targets yet." body="Add one to begin." />);
    expect(screen.getByText("No targets yet.")).toBeInTheDocument();
  });
});
