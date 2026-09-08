import type { ReactNode } from "react";
import s from "./sink.module.css";

/** A stable anchor from the visible title, so the nav can be derived from the
 *  page rather than declared beside it — a case cannot exist and be unreachable. */
export const slug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function Section({ id, title, blurb, children }: {
  id: string; title: string; blurb?: string; children: ReactNode;
}) {
  return (
    <section id={id} data-section={title} className={s.section}>
      <h2 className={s.sectionTitle}>{title}</h2>
      {blurb ? <p className={s.sectionBlurb}>{blurb}</p> : null}
      <div className={s.sectionBody}>{children}</div>
    </section>
  );
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={s.row}>
      <span className={s.rowLabel}>{label}</span>
      {children}
    </div>
  );
}

/** The sink's own demo frame. Named `Case` and not `Panel` because
 *  `display/Panel` is a component this page will have to be able to show. */
export function Case({ title, note, children }: {
  title: string; note?: string; children: ReactNode;
}) {
  const id = slug(title);
  return (
    <div id={id} data-case={title} className={s.panel}>
      <div className={s.panelHead}>
        <h3 className={s.panelTitle}>
          <a href={`#${id}`} className={s.anchor}>{title}</a>
        </h3>
        {note ? <span className={s.panelNote}>{note}</span> : null}
      </div>
      <div className={s.panelBody}>{children}</div>
    </div>
  );
}
