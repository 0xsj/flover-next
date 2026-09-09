import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checkbox, Fieldset, Label, Radio, RadioGroup, Switch, Toggle } from ".";

/* One file for the five choice controls: what each ANNOUNCES is the thing worth
 * pinning, because that is what differs between them and what a visual review
 * cannot see. */

describe("Checkbox has three states and the third is announced", () => {
  it("unchecked and checked", async () => {
    render(<><Checkbox id="c" /><Label htmlFor="c">Enabled</Label></>);
    const box = screen.getByRole("checkbox", { name: "Enabled" });
    expect(box).toHaveAttribute("aria-checked", "false");
    await userEvent.setup().click(box);
    expect(box).toHaveAttribute("aria-checked", "true");
  });

  it("indeterminate is `mixed`, a real third state and not a styling", () => {
    render(<><Checkbox id="c" checked="indeterminate" /><Label htmlFor="c">Some</Label></>);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed");
  });

  it("the label is outside, so the whole phrase is the hit target", async () => {
    render(<><Checkbox id="c" /><Label htmlFor="c">Enabled</Label></>);
    await userEvent.setup().click(screen.getByText("Enabled"));
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
  });
});

describe("Switch is a setting, and says so", () => {
  it("announces as a switch, not a checkbox", () => {
    render(<><Switch id="s" /><Label htmlFor="s">Notify me</Label></>);
    expect(screen.getByRole("switch", { name: "Notify me" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("flips on click", async () => {
    const onChange = vi.fn();
    render(<Switch aria-label="Notify me" onCheckedChange={onChange} />);
    await userEvent.setup().click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe("Toggle is a button that stays pressed", () => {
  it("reports aria-pressed rather than merely looking active", async () => {
    render(<Toggle aria-label="Bold">B</Toggle>);
    const t = screen.getByRole("button", { name: "Bold" });
    expect(t).toHaveAttribute("aria-pressed", "false");
    await userEvent.setup().click(t);
    expect(t).toHaveAttribute("aria-pressed", "true");
  });

  it("is a button, not a switch and not a checkbox", () => {
    render(<Toggle aria-label="Bold">B</Toggle>);
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});

describe("RadioGroup: the group owns the value, the legend owns the question", () => {
  const Subject = () => (
    <Fieldset legend="Notify me">
      <RadioGroup defaultValue="email">
        <div><Radio value="email" id="r1" /><Label htmlFor="r1">By email</Label></div>
        <div><Radio value="sms" id="r2" /><Label htmlFor="r2">By SMS</Label></div>
      </RadioGroup>
    </Fieldset>
  );

  it("the legend names the group so every option inherits the question", () => {
    render(<Subject />);
    expect(screen.getByRole("group", { name: "Notify me" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("one option is selected at a time", async () => {
    render(<Subject />);
    expect(screen.getByRole("radio", { name: "By email" })).toBeChecked();
    await userEvent.setup().click(screen.getByRole("radio", { name: "By SMS" }));
    expect(screen.getByRole("radio", { name: "By SMS" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "By email" })).not.toBeChecked();
  });

  it("ONE tab stop for the group, and arrows move within it", async () => {
    const user = userEvent.setup();
    render(<Subject />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "By email" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "By SMS" })).toHaveFocus();
    // and tabbing again leaves the group entirely rather than visiting option two
    await user.tab();
    expect(screen.getByRole("radio", { name: "By SMS" })).not.toHaveFocus();
  });
});

describe("the three lookalikes are three different roles", () => {
  it("checkbox · switch · button, never interchangeable", () => {
    render(
      <>
        <Checkbox aria-label="a" />
        <Switch aria-label="b" />
        <Toggle aria-label="c">c</Toggle>
      </>,
    );
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "c" })).toBeInTheDocument();
  });
});
