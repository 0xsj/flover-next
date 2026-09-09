import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Field } from "./field";
import { Input, Textarea } from "../input";

/* Every assertion restates a claim from the CONTRACT half of doc.ts. */

const Subject = (props: Partial<React.ComponentProps<typeof Field>> = {}) => (
  <Field label="Host" {...props}>
    {(control) => <Input {...control} />}
  </Field>
);

describe("the label is associated by identifier", () => {
  it("finds the control by its label text", () => {
    render(<Subject />);
    expect(screen.getByLabelText("Host")).toBeInstanceOf(HTMLInputElement);
  });

  it("clicking the label focuses the control", async () => {
    render(<Subject />);
    await userEvent.setup().click(screen.getByText("Host"));
    expect(screen.getByLabelText("Host")).toHaveFocus();
  });

  it("two fields with the same label do not collide", () => {
    render(<><Subject /><Subject /></>);
    const [a, b] = screen.getAllByLabelText("Host");
    expect(a.id).not.toBe(b.id);
    expect(a.id).toBeTruthy();
  });
});

describe("attributes are absent rather than false", () => {
  it("a plain field carries none of them", () => {
    render(<Subject />);
    const input = screen.getByLabelText("Host");
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("required");
  });

  it("required marks the control, and the visual mark is hidden from readers", () => {
    const { container } = render(<Subject required />);
    expect(screen.getByLabelText(/Host/)).toBeRequired();
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent("*");
  });

  it("an error sets aria-invalid, and only then", () => {
    const { rerender } = render(<Subject />);
    expect(screen.getByLabelText("Host")).not.toHaveAttribute("aria-invalid");
    rerender(<Subject error="Not a hostname." />);
    expect(screen.getByLabelText("Host")).toHaveAttribute("aria-invalid", "true");
  });
});

describe("the description wiring", () => {
  it("a hint is reachable from the control", () => {
    render(<Subject hint="A domain name." />);
    expect(screen.getByLabelText("Host")).toHaveAccessibleDescription("A domain name.");
  });

  it("an error is reachable from the control", () => {
    render(<Subject error="Not a hostname." />);
    expect(screen.getByLabelText("Host")).toHaveAccessibleDescription("Not a hostname.");
  });

  it("with both, the ERROR is named first — a reader announces them in order", () => {
    render(<Subject hint="A domain name." error="Not a hostname." />);
    const described = screen.getByLabelText("Host").getAttribute("aria-describedby")!.split(" ");
    expect(described).toHaveLength(2);
    expect(document.getElementById(described[0])).toHaveTextContent("Not a hostname.");
    expect(document.getElementById(described[1])).toHaveTextContent("A domain name.");
  });

  it("the error region is absent when there is no error", () => {
    const { container } = render(<Subject hint="A domain name." />);
    expect(container.textContent).not.toContain("Not a hostname.");
  });
});

describe("the shape is what makes the wiring hard to lose", () => {
  it("the control receives props already named as the attributes they become", () => {
    let seen: Record<string, unknown> = {};
    render(
      <Field label="Host" hint="h" error="e" required>
        {(control) => { seen = control; return <Input {...control} />; }}
      </Field>,
    );
    expect(Object.keys(seen).sort()).toEqual(
      ["aria-describedby", "aria-invalid", "id", "required"],
    );
  });

  it("Field owns no value — it is not a form library", () => {
    render(
      <Field label="Host">
        {(control) => <Input {...control} defaultValue="api.example.com" />}
      </Field>,
    );
    expect(screen.getByLabelText("Host")).toHaveValue("api.example.com");
  });
});

describe("the wiring survives what injection would not", () => {
  it("reaches a control nested inside a wrapper", () => {
    // A cloning implementation lands its props on the wrapper here and the
    // control ends up unlabelled — silently. This is the case the shape exists
    // for, so it is asserted rather than argued.
    render(
      <Field label="Host" error="Not a hostname.">
        {(control) => (
          <div className="layout">
            <span>
              <Input {...control} />
            </span>
          </div>
        )}
      </Field>,
    );
    const input = screen.getByLabelText("Host");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Not a hostname.");
  });

  it("wires a textarea exactly the same way", () => {
    render(
      <Field label="Notes" hint="Markdown is not rendered.">
        {(control) => <Textarea {...control} />}
      </Field>,
    );
    const box = screen.getByLabelText("Notes");
    expect(box.tagName).toBe("TEXTAREA");
    expect(box).toHaveAccessibleDescription("Markdown is not rendered.");
  });
});

describe("read-only is not disabled", () => {
  it("a read-only control stays focusable and its value selectable", async () => {
    render(<Field label="Id">{(c) => <Input {...c} readOnly defaultValue="i1" />}</Field>);
    const input = screen.getByLabelText("Id");
    expect(input).toHaveAttribute("readonly");
    expect(input).toBeEnabled();
    await userEvent.setup().click(input);
    expect(input).toHaveFocus();
  });

  it("a disabled control is not", async () => {
    render(<Field label="Id">{(c) => <Input {...c} disabled defaultValue="i1" />}</Field>);
    const input = screen.getByLabelText("Id");
    expect(input).toBeDisabled();
    await userEvent.setup().click(input);
    expect(input).not.toHaveFocus();
  });
});
