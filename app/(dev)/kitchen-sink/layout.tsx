import type { Metadata } from "next";
import { CaseNav } from "./_components/case-nav";
import { ThemeSwitch } from "./_components/theme-switch";
import { SECTIONS } from "./_sections/registry";
import s from "./_components/sink.module.css";

export const metadata: Metadata = {
  title: "Kitchen sink · flover",
  description: "Every token and, in time, every component, on one page.",
};

export default function KitchenSinkLayout({ children }: LayoutProps<"/kitchen-sink">) {
  return (
    <div className={s.shell}>
      <header className={s.header}>
        <div className={s.headerInner}>
          <span className={s.wordmark}>flover</span>
          <nav aria-label="Sections on this page" className={s.nav}>
            {SECTIONS.map(({ id, label }) => (
              <a key={id} href={`#${id}`} className={s.navLink}>{label}</a>
            ))}
          </nav>
          <div className={s.controls}><ThemeSwitch /></div>
        </div>
      </header>

      <div className={s.body}>
        <aside className={s.rail}>
          <CaseNav />
        </aside>

        <main className={s.main}>
          <div className={s.intro}>
            <h1 className={s.introTitle}>Kitchen sink</h1>
            <p className={s.introText}>
              The design system, rendered, with nothing above it. Both
              navigations are derived from the page rather than declared beside
              it — the top from the same registry it composes, the rail from the
              cases actually on screen — so nothing here can exist and be
              unreachable.
            </p>
          </div>
          <div className={s.sections}>{children}</div>
        </main>
      </div>
    </div>
  );
}
