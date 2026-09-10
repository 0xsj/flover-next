import type { Metadata } from "next";
import { Container, Flex } from "@/components/layout";
import { requireUser } from "@/app/_lib/root";
import { ActivityTable } from "./activity-table";
import s from "./page.module.css";

export const metadata: Metadata = { title: "Activity · flover" };

/* A server component that guards, and a client island that reads.
 *
 * The split is the point: the guard belongs on the server because the session
 * cookie is only readable there, and the list belongs in the cache because it
 * pages, filters and refetches — three things a server render would have to do
 * with a full round trip each. `decisions/0005` draws the same line for writes. */
export default async function ActivityPage() {
  const user = await requireUser();

  return (
    <Container width="page">
      <Flex direction="column" gap={7}>
        <div>
          <h1 className={s.title}>Activity</h1>
          <p className={s.lead}>
            Everything recorded on {user.email}. These rows are not invented:
            the fixture writes one as a side effect of each operation, the way a
            server would — so signing in adds a row, and revoking a session adds
            another. Every row carries the interaction it belonged to.
          </p>
        </div>

        <ActivityTable />
      </Flex>
    </Container>
  );
}
