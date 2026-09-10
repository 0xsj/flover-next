import { Container, Flex } from "@/components/layout";
import { PageHeader } from "@/components/patterns";
import { requireUser } from "@/app/_lib/root";
import { DashboardEditor } from "./editor";

export default async function EditableDashboardPage() {
  const user = await requireUser();
  return <Container><Flex direction="column" gap={8}>
    <PageHeader title="Make room for your work" description="A dashboard you can arrange around what matters. Add widgets, move them, and save your own view." />
    <DashboardEditor accountId={user.id} />
  </Flex></Container>;
}
