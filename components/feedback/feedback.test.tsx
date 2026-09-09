import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Alert, Skeleton, SkeletonText } from ".";

describe("Alert only becomes a live region when asked", () => {
  it("is NOT announced by default — most alerts are rendered with the page", () => {
    render(<Alert>Something to read.</Alert>);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("polite becomes a status, which waits for the reader's sentence to end", () => {
    render(<Alert live="polite">Saved.</Alert>);
    expect(screen.getByRole("status")).toHaveTextContent("Saved.");
  });

  it("assertive becomes an alert, which interrupts", () => {
    render(<Alert live="assertive" tone="crit">Your session expired.</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Your session expired.");
  });

  it("carries a title and an action without either becoming the announcement", () => {
    render(<Alert title="Rate limited" action={<button>Retry</button>}>Try again in 12s.</Alert>);
    expect(screen.getByText("Rate limited")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("a dismiss control is named, not a bare glyph", async () => {
    const onDismiss = vi.fn();
    render(<Alert onDismiss={onDismiss}>Gone in a moment.</Alert>);
    await userEvent.setup().click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("and there is no dismiss control when nothing handles it", () => {
    render(<Alert>Permanent.</Alert>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("Skeleton says nothing to a reader", () => {
  it("is hidden — ten placeholders must not be ten announcements", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("text placeholders are hidden as a group, not one by one", () => {
    const { container } = render(<SkeletonText lines={4} />);
    const group = container.firstElementChild!;
    expect(group).toHaveAttribute("aria-hidden", "true");
    expect(group.children).toHaveLength(4);
  });

  it("the last line is short, because real paragraphs end mid-line", () => {
    const { container } = render(<SkeletonText lines={3} />);
    const lines = [...container.firstElementChild!.children] as HTMLElement[];
    expect(lines[0].style.inlineSize).toBe("100%");
    expect(lines[2].style.inlineSize).toBe("62%");
  });

  it("takes a size, so it can be the shape of what is coming", () => {
    const { container } = render(<Skeleton width="120px" height="28px" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.inlineSize).toBe("120px");
    expect(el.style.blockSize).toBe("28px");
  });

  it("the BUSY state belongs to the region, and the skeleton does not claim it", () => {
    const { container } = render(
      <div aria-busy="true"><Skeleton /><Skeleton /></div>,
    );
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
    for (const sk of container.querySelectorAll("span")) {
      expect(sk).not.toHaveAttribute("aria-busy");
    }
  });
});
