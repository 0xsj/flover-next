import { Section } from "./section";
import s from "./sink.module.css";

export type Planned = { name: string; note: string; built?: boolean };

/** A group that exists as a directory and not yet as components.
 *
 *  It renders the group's job and what belongs in it, and nothing else. The
 *  point is that the shape of the design system is visible before it is built —
 *  and that an empty group says so rather than being absent, which would read
 *  as "we decided against it". `CLAUDE.md`: the null result is a result.
 *
 *  Deliberately NO cases. The rail derives from cases, so an unbuilt group shows
 *  its name and nothing under it, which is the honest signal. */
export function PlannedSection({
  id, title, blurb, components,
}: {
  id: string;
  title: string;
  blurb: string;
  components: readonly Planned[];
}) {
  const built = components.filter((c) => c.built).length;

  return (
    <Section id={id} title={title} blurb={blurb}>
      <div className={s.planned}>
        <div className={s.plannedHead}>
          <span className={s.plannedCount}>
            {built} of {components.length} built
          </span>
        </div>
        <ul className={s.plannedList}>
          {components.map((c) => (
            <li key={c.name} className={s.plannedItem} data-built={c.built || undefined}>
              <span className={s.plannedName}>{c.name}</span>
              <span className={s.plannedNote}>{c.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
