import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./pagination";

describe("Pagination contract", () => {
  it("moves through pages, exposes the current page, and stops at both ends", async () => {
    const user = userEvent.setup();
    function Example() { const [page, setPage] = useState(1); return <Pagination page={page} totalPages={24} onPageChange={setPage} />; }
    render(<Example />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    await user.click(screen.getByRole("button", { name: "Page 24" }));
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Page 1" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(screen.getByRole("button", { name: "Page 23" })).toHaveAttribute("aria-current", "page");
  });
  it("keeps navigation bounded for large collections while exposing adjacent pages", () => {
    render(<Pagination page={500} totalPages={10000} onPageChange={vi.fn()} />);
    for (const page of [1, 499, 500, 501, 10000]) expect(screen.getByRole("button", { name: `Page ${page}` })).toBeEnabled();
    expect(screen.getAllByRole("button").length).toBeLessThanOrEqual(9);
  });
  it.each([0, 1])("omits navigation for %i pages", (totalPages) => {
    render(<Pagination page={1} totalPages={totalPages} onPageChange={vi.fn()} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
