import Link from "next/link";
import { NavLink } from "@/components/navigation";
import { Text } from "@/components/typography";
import { chapters, manualHref } from "../_lib/chapters";
import s from "../manual.module.css";

export function ChapterNavigation({ current }: { current: string }) {
  return <nav aria-label="Manual chapters" className={s.chapterNav}>
    <Text size="sm" tone="muted">USER MANUAL</Text>
    <NavLink asChild><Link href="/cookbook/manual">Overview</Link></NavLink>
    <ol>{chapters.map((chapter, index) => <li key={chapter.slug}><NavLink active={current === chapter.slug} asChild><Link href={manualHref(chapter.slug)}><span className={s.chapterNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{chapter.title}</Link></NavLink></li>)}</ol>
    <a href="/cookbook/manual/download" download="flover-manual.md" className={s.download}>Download Markdown</a>
  </nav>;
}
