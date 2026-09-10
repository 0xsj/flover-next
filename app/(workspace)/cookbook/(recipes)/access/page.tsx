import { requireUser } from "@/app/_lib/root";
import { Container, Flex } from "@/components/layout";
import { PageHeader } from "@/components/patterns";
import { AccessDemo } from "./access-demo";
export const metadata = { title: "Capabilities · flover" };
export default async function Page() {
  const user = await requireUser();
  return <Container width="page"><Flex direction="column" gap={8}><PageHeader title="Access can change while you work" description="Render explicit decisions and their reasons. Refresh stale permissions and handle a server refusal at the affected region." /><AccessDemo key={user.id} accountId={user.id} /></Flex></Container>;
}
