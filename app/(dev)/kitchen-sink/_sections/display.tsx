import {
  Avatar, Badge, Empty, Mock, Panel, Presence, Stat,
  Table, TBody, Td, Th, THead, Tr,
} from "@/components/display";
import { Button } from "@/components/forms";
import type { Presence as PresenceValue } from "@/lib/kernel";
import { Case, Row, Section } from "../_components/section";
import s from "../_components/sink.module.css";

/* One case per component, so the rail is a catalog: anything in the group can
   be found by its own name. Two components share a case only where neither can
   be shown without the other. */

type CellRow = {
  name: string;
  owner: string;
  findings: number | undefined;
  server: PresenceValue<string>;
};

/* Every row is a different combination of the three states, deliberately: it is
   the only way to see that they stay distinguishable. */
const rows: CellRow[] = [
  { name: "api.example.com", owner: "Ada Lovelace", findings: 3,
    server: { state: "found", value: "nginx/1.24" } },
  { name: "www.example.com", owner: "Grace Hopper", findings: 0,
    server: { state: "empty" } },
  { name: "old.example.com", owner: "Alan Turing", findings: undefined,
    server: { state: "unmeasured", failure: { kind: "timeout", message: "Timed out." } } },
];

export function DisplaySection() {
  return (
    <Section
      id="display"
      title="Display"
      blurb="What a screen shows when it is not asking for anything — and where the three-states rule is most often lost. Three of these exist to make that loss hard: Presence renders the distinction, Stat refuses to print 0 for something nobody measured, and Empty is styled as the successful answer it is."
    >
      <Case title="Panel" note="a bounded region with a name — the frame most screens are made of">
        <div className={s.fieldGrid}>
          <Panel title="Targets" actions={<Badge glyph="●" tone="accent">healthy</Badge>}>
            A panel with a heading and its own controls.
          </Panel>
          <Panel>Untitled — no header row is rendered at all.</Panel>
        </div>
        <p className={s.limits}>
          <code>flush</code> removes the body padding for a child that owns its
          own edges: a table, a chart, a list drawing its own dividers.
        </p>
      </Case>

      <Case title="Table" note="compositional, and every row here is a different combination of states">
        <Panel title="Targets" actions={<Mock />} flush>
          <Table caption="Every row is a different combination of the three states.">
            <THead>
              <Tr><Th>Host</Th><Th>Owner</Th><Th numeric>Findings</Th><Th>Server</Th></Tr>
            </THead>
            <TBody>
              {rows.map((r) => (
                <Tr key={r.name}>
                  <Td>{r.name}</Td>
                  <Td>
                    <span className={s.choice}><Avatar name={r.owner} size="sm" />{r.owner}</span>
                  </Td>
                  <Td numeric>
                    {r.findings === undefined
                      ? <Presence of={{ state: "unmeasured", failure: { kind: "internal", message: "never counted" } }}>{(v: number) => v}</Presence>
                      : r.findings}
                  </Td>
                  <Td><Presence of={r.server}>{(v) => <span>{v}</span>}</Presence></Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </Panel>
        <p className={s.limits}>
          Row two has <strong>zero</strong> findings; row three has{" "}
          <strong>none recorded</strong>. One is a measurement, the other is the
          absence of one. Same in the Server column: <code>none</code> means a
          source was asked and said nothing, <code>–</code> means nobody asked.
          A cell holding a <code>Presence</code> is why this is compositional
          rather than taking <code>columns</code> and <code>rows</code>.
        </p>
      </Case>

      <Case title="Stat" note="undefined renders as – and never as 0">
        <Row label="measured">
          <div className={s.statRow}>
            <Stat label="Targets" value={12} />
            <Stat label="Findings" value={0} hint="measured, and it is zero" />
          </div>
        </Row>
        <Row label="unmeasured">
          <div className={s.statRow}>
            <Stat label="Coverage" hint="nobody has run this yet" />
          </div>
        </Row>
      </Case>

      <Case title="Presence" note="found · looked and found nothing · never checked">
        <Row label="found"><Presence of={{ state: "found", value: "nginx/1.24" }}>{(v) => <span>{v}</span>}</Presence></Row>
        <Row label="empty"><Presence of={{ state: "empty" }}>{(v: string) => v}</Presence></Row>
        <Row label="unmeasured">
          <Presence of={{ state: "unmeasured", failure: { kind: "timeout", message: "Timed out." } }}>
            {(v: string) => v}
          </Presence>
        </Row>
        <p className={s.limits}>
          The two absent states must not look alike, or the component has thrown
          away the distinction it exists to keep. Each carries its own title
          saying which it is — and <code>PRESENCE_MEANING</code> is defined once,
          so a cell, a legend and a screen reader cannot describe it three
          different ways.
        </p>
      </Case>

      <Case title="Badge" note="a status, never colour alone">
        <Row label="tones">
          <Badge glyph="●" tone="accent">healthy</Badge>
          <Badge glyph="▲" tone="warn">degraded</Badge>
          <Badge glyph="✕" tone="crit">failed</Badge>
          <Badge glyph="›" tone="info">queued</Badge>
          <Badge glyph="··">never checked</Badge>
        </Row>
        <p className={s.limits}>
          A glyph beside the hue and a word inside it, so the badge survives
          greyscale, a projector, and a reader who cannot distinguish the
          colours. The glyph is <code>aria-hidden</code> — the text is the
          announcement.
        </p>
      </Case>

      <Case title="Empty" note="a successful answer, styled as one">
        <Panel title="Targets">
          <Empty
            title="No targets yet."
            body="A target is something you have asked a tool to look at. Add one and its findings will appear here."
            action={<Button intent="primary" size="sm">Add a target</Button>}
          />
        </Panel>
        <p className={s.limits}>
          Deliberately not error styling. An empty list is a request that{" "}
          <strong>worked</strong>, and rendering it in red teaches people to read
          a working system as broken. It also says what is absent — “No targets
          yet”, not “No data”.
        </p>
      </Case>

      <Case title="Avatar" note="a person, with a fallback that is not a broken image">
        <Row label="fallback">
          <span className={s.choice}><Avatar name="Ada Lovelace" /> Ada Lovelace</span>
          <span className={s.choice}><Avatar name="Grace Hopper" size="sm" /> Grace Hopper</span>
        </Row>
        <p className={s.limits}>
          <code>name</code> is required even when an image is given: it is the
          fallback&rsquo;s content and the image&rsquo;s alternative text. An
          avatar with neither is a decorative circle claiming to identify
          somebody.
        </p>
      </Case>

      <Case title="Mock" note="a visible mark that this is not a record">
        <Row label="default"><Mock /></Row>
        <Row label="specific"><Mock note="Fixture data — the backend does not serve this yet." /></Row>
        <p className={s.limits}>
          Announced rather than decorative: somebody who cannot see the badge is
          exactly the person most likely to quote a fixture back at you as fact.
        </p>
      </Case>
    </Section>
  );
}
