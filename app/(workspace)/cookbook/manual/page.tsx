import Link from "next/link";
import { Card, CardBody, CardDescription, CardHeader, CardLink, CardTitle } from "@/components/display";
import { Button } from "@/components/forms";
import { Container, Flex } from "@/components/layout";
import { PageHeader } from "@/components/patterns";
import { Text } from "@/components/typography";
import { chapters, manualHref } from "./_lib/chapters";
import s from "./manual.module.css";

export const metadata = { title: "User manual · flover", description: "Understand Flover's layers, Result/Failure model, adapters and recovery contracts." };
export default function Page() {
  return <Container width="page"><Flex direction="column" gap={9}>
    <PageHeader title="Build with the architecture" description="A practical user manual for Flover. Understand the choices underneath the interface, then use them to build your own product."
      actions={<Button asChild><a href="/cookbook/manual/download" download="flover-manual.md">Download Markdown</a></Button>} />
    <Card><CardHeader><CardTitle level={2}>Start with an outcome. Keep its meaning.</CardTitle><CardDescription>The layers are useful because each owns a decision: which operation to perform, how to reach it, what the response means, and how the user can recover.</CardDescription></CardHeader><CardBody><Flex gap={4} wrap><Button intent="primary" asChild><Link href={manualHref("orientation")}>Read the manual</Link></Button><Button asChild><Link href={manualHref("results-and-failures")}>Explore Result and Failure</Link></Button></Flex></CardBody></Card>
    <div className={s.chapterGrid}>{chapters.map((chapter, index) => <Card key={chapter.slug}><CardHeader><Text size="sm" tone="muted">CHAPTER {String(index + 1).padStart(2, "0")}</Text><CardTitle level={2}><CardLink asChild><Link href={manualHref(chapter.slug)}>{chapter.title}</Link></CardLink></CardTitle><CardDescription>{chapter.description}</CardDescription></CardHeader></Card>)}</div>
    <Text size="sm" tone="muted">The manual is public. Working recipes may ask you to sign in. Source references identify files in your checkout; the downloadable manual contains the same chapter content.</Text>
  </Flex></Container>;
}
