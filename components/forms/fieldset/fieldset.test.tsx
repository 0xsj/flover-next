import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Fieldset } from "./fieldset";

describe("a group is named by its legend", () => {
  it("the legend names the group, so every control inside inherits it", () => {
    render(
      <Fieldset legend="Notify me">
        <label><input type="radio" name="n" value="email" /> By email</label>
        <label><input type="radio" name="n" value="sms" /> By SMS</label>
      </Fieldset>,
    );
    // The accessible name of the group, which a reader announces before EACH
    // option — the thing a styled paragraph above the group cannot do.
    expect(screen.getByRole("group", { name: "Notify me" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });
});

describe("the wiring stays on the CONTAINER", () => {
  it("hint and error describe the group, not one control", () => {
    render(
      <Fieldset legend="Notify me" hint="You can change this later." error="Pick one.">
        <input type="radio" name="n" aria-label="By email" />
      </Fieldset>,
    );
    const group = screen.getByRole("group", { name: "Notify me" });
    expect(group).toHaveAccessibleDescription("Pick one. You can change this later.");
    expect(group).toHaveAttribute("aria-invalid", "true");
    // and NOT on the control — a description applying to one of four is wrong
    // three times.
    expect(screen.getByRole("radio")).not.toHaveAttribute("aria-describedby");
  });

  it("names the error first, because a reader announces them in order", () => {
    render(<Fieldset legend="G" hint="hint text" error="error text"><span /></Fieldset>);
    const ids = screen.getByRole("group").getAttribute("aria-describedby")!.split(" ");
    expect(document.getElementById(ids[0])).toHaveTextContent("error text");
    expect(document.getElementById(ids[1])).toHaveTextContent("hint text");
  });

  it("absent rather than false when there is neither", () => {
    render(<Fieldset legend="G"><span /></Fieldset>);
    const group = screen.getByRole("group");
    expect(group).not.toHaveAttribute("aria-describedby");
    expect(group).not.toHaveAttribute("aria-invalid");
  });

  it("two groups with the same legend do not collide", () => {
    render(
      <>
        <Fieldset legend="G" error="a"><span /></Fieldset>
        <Fieldset legend="G" error="b"><span /></Fieldset>
      </>,
    );
    const [a, b] = screen.getAllByRole("group");
    expect(a.getAttribute("aria-describedby")).not.toBe(b.getAttribute("aria-describedby"));
  });
});
