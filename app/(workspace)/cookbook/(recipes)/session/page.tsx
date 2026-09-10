import { requireUser } from "@/app/_lib/root";
import { Container, Flex } from "@/components/layout";
import { PageHeader } from "@/components/patterns";
import { SessionDemo } from "./session-demo";
export const metadata = { title: "Session recovery · flover" };
export default async function Page() {
  const user = await requireUser();
  return <Container width="page"><Flex direction="column" gap={8}><PageHeader title="Pick up where you left off" description="Expire a session while editing or saving. Verify the account, return to the editor, and resolve the original save." /><SessionDemo key={user.id} accountId={user.id} /></Flex></Container>;
}
