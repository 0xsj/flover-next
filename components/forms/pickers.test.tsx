import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { useState } from "react";
import { Combobox, DatePicker, DateRangePicker, MultiSelect } from ".";

const options = [{ value: "ada", label: "Ada Lovelace" }, { value: "grace", label: "Grace Hopper" }];

it("keeps a reversed typed range editable in a controlled picker", async () => {
  function Example() {
    const [value, setValue] = useState<{ start: string; end: string } | null>({ start: "2026-09-10", end: "2026-09-12" });
    return <><DateRangePicker label="Period" value={value} onValueChange={setValue} /><button>Done</button></>;
  }
  const user = userEvent.setup();
  render(<Example />);
  const days = screen.getAllByRole("spinbutton", { name: /day,/ });
  await user.click(days[0]);
  await user.keyboard("20");
  await user.click(screen.getByRole("button", { name: "Done" }));
  expect(days[0]).toHaveTextContent("20");
  expect(screen.getByText("Start date must be before end date.")).toBeVisible();
  await user.click(days[1]);
  await user.keyboard("22");
  await user.click(screen.getByRole("button", { name: "Done" }));
  expect(days[1]).toHaveTextContent("22");
  expect(screen.queryByText("Start date must be before end date.")).not.toBeInTheDocument();
});

it("rejects an unavailable interior day when range endpoints are typed", async () => {
  const user = userEvent.setup();
  render(<form aria-label="Booking" onSubmit={(event) => event.preventDefault()}><DateRangePicker label="Period" defaultValue={{ start: "2026-09-10", end: "2026-09-12" }} isDateUnavailable={(date) => date === "2026-09-18"} /><button type="submit">Save</button></form>);
  const end = screen.getAllByRole("spinbutton", { name: /day,/ })[1];
  await user.click(end);
  await user.keyboard("20");
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByText("The range includes unavailable dates.")).toBeVisible();
  expect((screen.getByRole("form") as HTMLFormElement).checkValidity()).toBe(false);
  await user.click(end);
  await user.keyboard("17");
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.queryByText("The range includes unavailable dates.")).not.toBeInTheDocument();
  expect((screen.getByRole("form") as HTMLFormElement).checkValidity()).toBe(true);
});

it("submits selected IDs and date strings rather than labels or search text", () => {
  render(<form aria-label="Example"><Combobox label="Owner" name="owner" options={options} defaultValue="ada" /><MultiSelect label="Reviewers" name="reviewer" options={options} defaultValue={["grace", "ada"]} /><DatePicker label="Due" name="due" defaultValue="2026-09-10" /><DateRangePicker label="Period" startName="start" endName="end" defaultValue={{ start: "2026-09-10", end: "2026-09-12" }} /></form>);
  const data = new FormData(screen.getByRole("form") as HTMLFormElement);
  expect(data.get("owner")).toBe("ada");
  expect(data.getAll("reviewer")).toEqual(["grace", "ada"]);
  expect(data.get("due")).toBe("2026-09-10");
  expect(data.get("start")).toBe("2026-09-10");
  expect(data.get("end")).toBe("2026-09-12");
});
it("connects compound labels, errors, and hints to the input", () => {
  render(<Combobox label="Owner" options={options} required hint="Choose a person." error="An owner is required." />);
  const input = screen.getByRole("combobox", { name: "Owner" });
  expect(input).toHaveAttribute("aria-invalid", "true");
  const descriptions = input.getAttribute("aria-describedby")!.split(" ").map((id) => document.getElementById(id)?.textContent).join(" ");
  expect(descriptions).toContain("Choose a person.");
  expect(descriptions).toContain("An owner is required.");
});
it("keeps a required combobox name stable while its popup is open", async () => {
  const user = userEvent.setup();
  render(<Combobox label="Owner" options={options} required />);
  const input = screen.getByRole("combobox", { name: "Owner" });
  await user.type(input, "Grace");
  expect(screen.getByRole("option", { name: "Grace Hopper" })).toBeVisible();
  expect(input).toHaveAccessibleName("Owner");
});
it("removes selected tags and restores uncontrolled defaults on native reset", async () => {
  const user = userEvent.setup();
  render(<form aria-label="Example"><MultiSelect label="Reviewers" name="reviewer" options={options} defaultValue={["ada", "grace"]} /><button type="reset">Reset</button></form>);
  await user.click(screen.getByRole("button", { name: "Remove Ada Lovelace" }));
  expect(new FormData(screen.getByRole("form") as HTMLFormElement).getAll("reviewer")).toEqual(["grace"]);
  await user.click(screen.getByRole("button", { name: "Reset" }));
  await waitFor(() => expect(screen.getByRole("button", { name: "Remove Ada Lovelace" })).toBeInTheDocument());
  expect(new FormData(screen.getByRole("form") as HTMLFormElement).getAll("reviewer")).toEqual(["ada", "grace"]);
});
it("disables choice inputs and removes tag actions for locked values", () => {
  render(<><Combobox label="Owner" options={options} disabled defaultValue="ada" /><MultiSelect label="Reviewers" options={options} readOnly value={["grace"]} /></>);
  expect(screen.getByRole("combobox", { name: "Owner" })).toBeDisabled();
  expect(screen.getByRole("combobox", { name: "Reviewers" })).toHaveAttribute("readonly");
  expect(screen.queryByRole("button", { name: "Remove Grace Hopper" })).not.toBeInTheDocument();
  expect(within(screen.getByRole("list", { name: "Selected Reviewers" })).getByText("Grace Hopper")).toBeVisible();
});
it("clears and resets a date without manufacturing a timezone", async () => {
  const user = userEvent.setup();
  render(<form aria-label="Example"><DatePicker label="Due" name="due" defaultValue="2024-02-29" /><button type="reset">Reset</button></form>);
  await user.click(screen.getByRole("button", { name: "Clear Due" }));
  expect(new FormData(screen.getByRole("form") as HTMLFormElement).get("due")).toBe("");
  await user.click(screen.getByRole("button", { name: "Reset" }));
  await waitFor(() => expect(new FormData(screen.getByRole("form") as HTMLFormElement).get("due")).toBe("2024-02-29"));
});
