import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/forms";
import { Container, Flex } from "@/components/layout";
import { Heading, Text } from "@/components/typography";
import { ArrowUpRight } from "@/components/utility";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "flover-next · Next.js template",
  description: "An opinionated Next.js starter with a composable design system, clear layers, and thoughtful error handling.",
};

export default function Home() {
  return <main className={s.landing}>
    <Container width="measure" className={s.content}>
      <Text size="sm" tone="muted" className={s.eyebrow}>Next.js template</Text>
      <Heading level={1} size="xl" className={s.title}>flover-next</Heading>
      <Text size="lg" tone="muted" className={s.description}>An opinionated starter with a composable design system, clear layers, and thoughtful error handling. A foundation for your next product.</Text>
      <nav aria-label="Start exploring" className={s.navigation}>
        <Flex gap={4} wrap className={s.actions}>
          <Button asChild intent="primary" size="lg"><Link href="/kitchen-sink">Explore the kitchen sink <ArrowUpRight size={15} aria-hidden="true" /></Link></Button>
          <Button asChild size="lg"><Link href="/cookbook">Browse the cookbook</Link></Button>
        </Flex>
        <Link href="/cookbook/manual" className={s.manual}>Read the user manual</Link>
      </nav>
    </Container>
  </main>;
}
