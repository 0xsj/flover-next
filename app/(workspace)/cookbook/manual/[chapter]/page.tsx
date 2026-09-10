import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/forms";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/disclosure";
import { Container, Flex } from "@/components/layout";
import { PageHeader } from "@/components/patterns";
import { Heading, Text } from "@/components/typography";
import { ChapterNavigation } from "../_components/chapter-navigation";
import { ManualBlock } from "../_components/manual-block";
import { chapters, findChapter, manualHref } from "../_lib/chapters";
import s from "../manual.module.css";

type Props = { params: Promise<{ chapter: string }> };
export function generateStaticParams() { return chapters.map(chapter => ({ chapter: chapter.slug })); }
export async function generateMetadata({ params }: Props) {
  const chapter = findChapter((await params).chapter);
  return { title: chapter ? `${chapter.title} · Flover manual` : "Chapter not found · flover", description: chapter?.description };
}
export default async function Page({ params }: Props) {
  const chapter = findChapter((await params).chapter);
  if (!chapter) notFound();
  const index = chapters.indexOf(chapter), previous = chapters[index - 1], next = chapters[index + 1];
  return <Container width="page"><div className={s.reader}>
    <aside className={s.sidebar}>
      <div className={s.desktopChapters}><ChapterNavigation current={chapter.slug} /></div>
      <div className={s.mobileChapters}><Accordion key={chapter.slug} type="single" collapsible><AccordionItem value="chapters"><AccordionTrigger>Chapters · {index + 1} of {chapters.length}</AccordionTrigger><AccordionContent><ChapterNavigation current={chapter.slug} /></AccordionContent></AccordionItem></Accordion></div>
    </aside>
    <article className={s.article}>
      <div className={s.chapterHeader}><Text size="sm" tone="muted">CHAPTER {String(index + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}</Text><PageHeader title={chapter.title} description={chapter.description} /></div>
      <nav aria-label="On this page" className={s.contents}><Text size="sm" weight="medium">On this page</Text><ul>{chapter.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ul></nav>
      {chapter.sections.map(section => <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className={s.section}><Heading level={2} size="md" id={`${section.id}-title`}>{section.title}</Heading>{section.blocks.map((block, index) => <ManualBlock key={index} block={block} />)}</section>)}
      <nav aria-label="Continue reading" className={s.continue}><Flex wrap gap={4}>
        <Button asChild><Link href={previous ? manualHref(previous.slug) : "/cookbook/manual"}>{previous ? `Previous: ${previous.title}` : "Back to overview"}</Link></Button>
        {next ? <Button intent="primary" asChild><Link href={manualHref(next.slug)}>Next: {next.title}</Link></Button> : <Button intent="primary" asChild><Link href="/cookbook">Explore the cookbook</Link></Button>}
      </Flex></nav>
    </article>
  </div></Container>;
}
