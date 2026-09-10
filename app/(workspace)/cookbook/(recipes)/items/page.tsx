import { Suspense } from "react";
import { requireUser } from "@/app/_lib/root";
import { Container, Flex } from "@/components/layout";
import { PageHeader } from "@/components/patterns";
import { Text } from "@/components/typography";
import { ItemWorkspace } from "./workspace";

export const metadata = { title: "Items · flover" };
export default async function ItemsPage() {
  const user = await requireUser();
  return <Container width="page"><Flex direction="column" gap={8}>
    <PageHeader title="From a list to a saved change" description="Browse an item, edit its details, and follow the save through success or recovery. Your view has an address; your draft has its own lifecycle." />
    <Suspense fallback={<Text>Reading the item view…</Text>}><ItemWorkspace key={user.id} accountId={user.id} /></Suspense>
  </Flex></Container>;
}
