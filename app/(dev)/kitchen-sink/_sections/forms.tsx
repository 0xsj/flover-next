import Link from "next/link";
import { Button } from "@/components/forms";
import { Plus, Trash2 } from "@/components/utility";
import { Case, Row, Section } from "../_components/section";
import { readSources } from "../_lib/source";
import s from "../_components/sink.module.css";

/* One case per COMPONENT, not per variant. The rail is derived from the cases,
   so a case named "Intents" puts a variant in the menu where the component
   should be — you cannot find Button by looking for Button.

   This section is also a SERVER component and passes no handler, which is the
   point: a Button that manufactured one could not render here at all. */
export async function FormsSection() {
  const sources = await readSources([
    "forms/button/button.tsx",
    "forms/button/button.variants.ts",
    "forms/button/button.module.css",
  ]);

  return (
    <Section
      id="forms"
      title="Forms"
      blurb="Button first. It borrows one thing from the headless library — the composition slot — because the platform element is already focusable, keyboard-operable and self-announcing; everything else it needs is an attribute."
    >
      <Case title="Button" note="intent · size · state · asChild" sources={sources}>
        <Row label="intent">
          <Button intent="primary">Primary</Button>
          <Button>Secondary</Button>
          <Button intent="ghost">Ghost</Button>
          <Button intent="danger">Danger</Button>
          <Button intent="link">Link</Button>
        </Row>

        <Row label="size">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Add"><Plus size={14} /></Button>
          <Button size="icon" intent="danger" aria-label="Delete"><Trash2 size={14} /></Button>
        </Row>

        {/* No icon slot, deliberately: a caller placing an icon among the
            children already works, so a prop for it would be API for nothing. */}
        <Row label="icon + label">
          <Button intent="primary"><Plus size={14} aria-hidden="true" />Add target</Button>
          <Button intent="danger"><Trash2 size={14} aria-hidden="true" />Delete</Button>
        </Row>

        <Row label="disabled">
          <Button disabled>Disabled</Button>
          <Button intent="primary" disabled>Disabled</Button>
        </Row>

        <Row label="loading">
          <Button loading>Saving</Button>
          <Button intent="primary" loading>Saving</Button>
        </Row>

        <Row label="asChild">
          <Button asChild>
            <Link href="#button">A link wearing the button</Link>
          </Button>
          <Button asChild disabled>
            <Link href="#button">Inert link</Link>
          </Button>
        </Row>

        <p className={s.limits}>
          <strong>Loading keeps the label</strong> rather than replacing it —
          swapping the text moves the control under a reader&rsquo;s cursor. The
          indicator is hidden from assistive technology; <code>aria-busy</code>{" "}
          is the announcement.
          <br />
          <br />
          <strong>The two inert branches differ.</strong> On the native element{" "}
          <code>disabled</code> does the whole job. On an arbitrary element it
          means nothing and cannot be removed, so the mitigation is{" "}
          <code>aria-disabled</code>, removal from the tab order, and suppressed
          pointer events. That stops a click and stops tabbing to it. It does{" "}
          <strong>not</strong> stop keyboard activation if something focuses the
          element programmatically — closing that gap needs a synthesised
          handler, which is forbidden. The rule is: do not render a link you do
          not want followed.
        </p>
      </Case>
    </Section>
  );
}
