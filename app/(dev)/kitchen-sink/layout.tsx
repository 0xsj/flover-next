import type { Metadata } from "next";
import Link from "next/link";
import { QueryProvider } from "@/lib/query";
import { CaseNav } from "./_components/case-nav";
import { CatalogNav } from "./_components/catalog-nav";
import { DensityToggle, Mark, ThemeToggle } from "@/components/chrome";
import s from "./_components/sink.module.css";

export const metadata: Metadata = {
  title: "Kitchen sink · flover",
  description: "Flover’s component catalog: foundations, primitives, and reusable compositions.",
};

export default function KitchenSinkLayout({ children }: LayoutProps<"/kitchen-sink">) {
  return <QueryProvider>
    <div className={s.shell}>
      <a href="#gallery-main" className={s.skipLink}>Skip to examples</a>
      <header className={s.header}>
        <div className={s.headerInner}>
          <Link href="/kitchen-sink" aria-label="Flover kitchen sink"><Mark /></Link>
          <span className={s.headerLabel}>Component catalog</span>
          <div className={s.controls}><ThemeToggle /><DensityToggle /></div>
        </div>
      </header>
      <div className={s.body}>
        <CatalogNav />
        <main id="gallery-main" tabIndex={-1} className={s.main} data-gallery-content>
          <div className={s.sections}>{children}</div>
        </main>
        <aside className={s.contentsRail}><CaseNav /></aside>
      </div>
    </div>
  </QueryProvider>;
}
