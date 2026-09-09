"use client";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTrigger,
  Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
  Popover, PopoverContent, PopoverTrigger, Tooltip, TooltipProvider,
} from "@/components/overlays";
import { Button, Field, Input } from "@/components/forms";
import { Flex } from "@/components/layout";
import { Case, Row, Section } from "../_components/section";
import s from "../_components/sink.module.css";

export function OverlaysSection() {
  return (
    <TooltipProvider>
      <Section
        id="overlays"
        title="Overlays"
        blurb="Content over the page, and the one group the testing decision commits to interaction tests: focus moves in, focus is trapped, Escape closes, focus returns to the trigger. Those break silently on refactor and are invisible to whoever broke them — all four are asserted, plus the scroll lock."
      >
        <Case title="Dialog" note="dismissible; the accessible name is a required prop">
          <Dialog>
            <DialogTrigger asChild><Button>Rename target</Button></DialogTrigger>
            <DialogContent title="Rename target" description="This changes it everywhere it appears.">
              <Field label="Name" hint="A short label, not a hostname.">
                {(control) => <Input {...control} defaultValue="api" />}
              </Field>
              <DialogFooter>
                <DialogClose asChild><Button>Cancel</Button></DialogClose>
                <DialogClose asChild><Button intent="primary">Save</Button></DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <p className={s.limits}>
            <code>title</code> is a required <strong>prop</strong>, not a child.
            A dialog with no name is announced as &ldquo;dialog&rdquo; and
            nothing else — the commonest defect in this component, and one a
            visual review cannot see. Making it a prop turns it from a thing you
            remember into a thing that does not typecheck.
          </p>
        </Case>

        <Case title="AlertDialog" note="requires a choice — no outside dismissal, no close button">
          <AlertDialog>
            <AlertDialogTrigger asChild><Button intent="danger">Delete target</Button></AlertDialogTrigger>
            <AlertDialogContent
              title="Delete this target?"
              description="Its findings go with it. This cannot be undone."
            >
              <AlertDialogCancel asChild><Button>Keep it</Button></AlertDialogCancel>
              <AlertDialogAction asChild><Button intent="danger">Delete</Button></AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
          <p className={s.limits}>
            <code>description</code> is required here and optional on a Dialog: a
            question you cannot look away from has to say what it is asking.
            Focus lands on <strong>Keep it</strong>, never the destructive
            action — a confirmation whose default is &ldquo;yes&rdquo; is a
            confirmation that confirms itself.
          </p>
        </Case>

        <Case title="Popover" note="focusable, dismissible, may contain controls">
          <Popover>
            <PopoverTrigger asChild><Button>Filter</Button></PopoverTrigger>
            <PopoverContent>
              <Flex direction="column" gap={4}>
                <span>Anything focusable belongs here rather than in a tooltip.</span>
                <Button size="sm">Apply</Button>
              </Flex>
            </PopoverContent>
          </Popover>
        </Case>

        <Case title="DropdownMenu" note="a list of actions — no current value">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button>Actions</Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>This target</DropdownMenuLabel>
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Re-run checks</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem data-tone="crit">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <p className={s.limits}>
            A menu picks an <strong>action</strong>; a select picks a{" "}
            <strong>value</strong>. Reopening a menu shows the same list, and
            nothing in it is marked current — that is a select&rsquo;s job. The
            highlight follows <code>data-highlighted</code> rather than{" "}
            <code>:hover</code>, which the primitive sets for keyboard too.
          </p>
        </Case>

        <Case title="Tooltip" note="supplementary — the trigger must already have a name">
          <Row label="hint">
            <Tooltip content="Runs every enabled check against this target.">
              <Button>Re-run</Button>
            </Tooltip>
            <Tooltip content="Nothing has been observed here in ninety days." side="right">
              <Button intent="ghost">Stale</Button>
            </Tooltip>
          </Row>
          <p className={s.limits}>
            A tooltip is unreachable by touch and by anyone who does not hover,
            so it may <strong>never carry the only copy of anything</strong>. If
            the content is a control, it is a Popover; if it is the
            trigger&rsquo;s name, it belongs in the trigger.
          </p>
        </Case>
      </Section>
    </TooltipProvider>
  );
}
