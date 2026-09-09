import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTrigger,
  Dialog, DialogContent, DialogFooter, DialogTrigger,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  Popover, PopoverContent, PopoverTrigger,
} from ".";

/* The four obligations `decisions/0001` committed this group to:
 * focus trapped · escape closes · scroll locked · focus restored to the trigger.
 *
 * All four are asserted. The scroll lock nearly was not: the first attempt
 * assumed a test DOM could not observe it and shipped a check that asserted a
 * boolean was a boolean. Probing the body showed `data-scroll-locked` and an
 * inert `pointer-events` sitting right there. A test that cannot fail is worse
 * than a missing one, because it reports coverage. */

const DialogSubject = () => (
  <Dialog>
    <DialogTrigger>Open</DialogTrigger>
    <DialogContent title="Rename target" description="This changes it everywhere.">
      <input aria-label="Name" />
      <DialogFooter><button>Save</button></DialogFooter>
    </DialogContent>
  </Dialog>
);

describe("Dialog", () => {
  it("has an accessible NAME, because the title is a required prop", async () => {
    await userEvent.setup().click(render(<DialogSubject />).getByText("Open"));
    expect(screen.getByRole("dialog", { name: "Rename target" })).toBeInTheDocument();
  });

  it("moves focus INTO the dialog when it opens", async () => {
    render(<DialogSubject />);
    await userEvent.setup().click(screen.getByText("Open"));
    await waitFor(() => {
      expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);
    });
  });

  it("TRAPS focus: tabbing past the last control returns to the first", async () => {
    const user = userEvent.setup();
    render(<DialogSubject />);
    await user.click(screen.getByText("Open"));
    const dialog = await screen.findByRole("dialog");

    for (let i = 0; i < 8; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it("ESCAPE closes it", async () => {
    const user = userEvent.setup();
    render(<DialogSubject />);
    await user.click(screen.getByText("Open"));
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("RESTORES focus to the trigger on close", async () => {
    const user = userEvent.setup();
    render(<DialogSubject />);
    const trigger = screen.getByText("Open");
    await user.click(trigger);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("the close control is named, not a bare glyph", async () => {
    await userEvent.setup().click(render(<DialogSubject />).getByText("Open"));
    expect(await screen.findByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});

describe("AlertDialog requires a choice", () => {
  const Subject = ({ onConfirm = vi.fn() }) => (
    <AlertDialog>
      <AlertDialogTrigger>Delete</AlertDialogTrigger>
      <AlertDialogContent title="Delete this target?" description="Its findings go with it.">
        <AlertDialogCancel>Keep it</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );

  it("announces as an alertdialog, not a dialog", async () => {
    await userEvent.setup().click(render(<Subject />).getByText("Delete"));
    expect(await screen.findByRole("alertdialog", { name: "Delete this target?" })).toBeInTheDocument();
  });

  it("has NO close button — the only ways out are the two choices and Escape", async () => {
    await userEvent.setup().click(render(<Subject />).getByText("Delete"));
    await screen.findByRole("alertdialog");
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep it" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("focus lands on the cancel, not the destructive action", async () => {
    await userEvent.setup().click(render(<Subject />).getByText("Delete"));
    await screen.findByRole("alertdialog");
    await waitFor(() => expect(screen.getByRole("button", { name: "Keep it" })).toHaveFocus());
  });

  it("the action runs and the dialog closes", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<Subject onConfirm={onConfirm} />);
    await user.click(screen.getByText("Delete"));
    await user.click(await screen.findByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });
});

describe("Popover and DropdownMenu", () => {
  it("a popover holds focusable content and escape closes it", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>More</PopoverTrigger>
        <PopoverContent><button>Inside</button></PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByText("More"));
    expect(await screen.findByRole("button", { name: "Inside" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("button", { name: "Inside" })).not.toBeInTheDocument());
  });

  it("a menu is a list of ACTIONS, with keyboard navigation", async () => {
    const onPick = vi.fn();
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onPick}>Rename</DropdownMenuItem>
          <DropdownMenuItem>Archive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByText("Actions"));
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onPick).toHaveBeenCalled();
  });

  it("a menu has no current value — reopening shows the same list", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent><DropdownMenuItem>Rename</DropdownMenuItem></DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByText("Actions"));
    const item = await screen.findByRole("menuitem");
    // no aria-selected / aria-checked: that is a Select's job
    expect(item).not.toHaveAttribute("aria-selected");
    expect(item).not.toHaveAttribute("aria-checked");
  });
});

describe("scroll lock, and the page behind it", () => {
  it("locks the page while a modal is open and releases it on close", async () => {
    const user = userEvent.setup();
    render(<DialogSubject />);
    expect(document.body).not.toHaveAttribute("data-scroll-locked");

    await user.click(screen.getByText("Open"));
    await screen.findByRole("dialog");
    expect(document.body).toHaveAttribute("data-scroll-locked");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(document.body).not.toHaveAttribute("data-scroll-locked"));
  });

  it("makes the page behind inert, so a click cannot reach it", async () => {
    const user = userEvent.setup();
    render(<DialogSubject />);
    await user.click(screen.getByText("Open"));
    await screen.findByRole("dialog");
    expect(document.body.style.pointerEvents).toBe("none");
  });
});
