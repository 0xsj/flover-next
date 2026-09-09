import Link from "next/link";
import { Badge, Empty, Panel, Stat } from "@/components/display";
import { Alert } from "@/components/feedback";
import { Box, Container, Flex } from "@/components/layout";
import { presenceOf } from "@/lib/kernel";
import { listSessions } from "@/lib/services/session";
import { requireUser, serverRoot } from "@/app/_lib/root";
import { OtherDevices } from "./_components/other-devices";
import s from "./page.module.css";

/* The one screen behind the shell, and it is a placeholder on purpose.
 *
 * What it demonstrates is the layering, not a product: a server component asks
 * the composition root for a client, the root was handed a token read from a
 * cookie by the only file that knows about cookies, and the service that
 * answered has no idea any of that happened.
 *
 * # Two panels read the same thing down two different paths
 *
 * Deliberately, because they are the two paths a real screen has and they fail
 * differently. The server panel runs at render, is chaos-able through the query
 * string, and renders its three states as markup. The client panel runs in the
 * browser through the cache, over a fetch adapter pointed at this application's
 * own route handler — and its retry policy asks the kernel rather than a status
 * code. A template that only ever showed one of the two would be teaching half
 * the architecture.
 *
 * `requireUser` is called again here rather than passed down from the layout.
 * That is not a second request — React's `cache` makes it the same one — and it
 * means this page is guarded on its own terms rather than by a parent it has to
 * trust. */
export default async function AppPage() {
  const user = await requireUser();
  const root = await serverRoot();

  /* Three states, named at the render. Whether "only this session" reads as
     EMPTY is a display question, so the service returns the list and the fold
     to null happens here — and `presenceOf` then makes it impossible to write
     the two-branch version that loses one. */
  const presence = presenceOf(
    (await listSessions(root.clientFor("session"))).map((all) => {
      const others = all.filter((session) => !session.current);
      return others.length ? others : null;
    }),
  );

  return (
    <Container width="page">
      <Flex direction="column" gap={7}>
        <div>
          <h1 className={s.title}>Welcome back, {user.name.split(" ")[0]}</h1>
          <p className={s.lead}>
            You are signed in. Everything below came through the same tiers a
            product would use — there is simply no product here yet.
          </p>
        </div>

        {root.underChaos ? (
          /* A forced failure that looks real is an afternoon wasted, so a
             surface running under a chaos plan says so before anything else. */
          <Alert tone="warn" title="A chaos plan is in force">
            Failures on this page are being manufactured from the query string.
            Nothing below the composition root knows that.
          </Alert>
        ) : null}

        {root.usingFixtures("session") ? (
          /* Transport-level provenance, rendered. "Nobody looked" and "a fixture
             answered" are different claims, and a screen that shows them alike
             has thrown away the difference at the moment it had it. */
          <Alert tone="info" title="Answered by fixtures">
            No <code>API_BASE_URL</code> is set, so every call is served from the
            in-memory route table. Set one and the adapter changes; nothing above{" "}
            <code>lib/root</code> changes at all.
          </Alert>
        ) : null}

        <Flex gap={6} wrap>
          <Panel title="Session">
            <Flex direction="column" gap={5}>
              <Stat label="Signed in as" value={user.email} />
              <Stat label="User id" value={user.id} />
              <Box>
                <Badge tone={root.usingFixtures("session") ? "warn" : "accent"}>
                  {root.usingFixtures("session") ? "fixtures" : "network"}
                </Badge>
              </Box>
            </Flex>
          </Panel>

          <Panel title="This interaction">
            <Flex direction="column" gap={5}>
              <Stat label="Correlation id" value={root.correlationId} />
              <p className={s.note}>
                One root per interaction, so both reads this render made carry
                this id — and either failure would name it. Build a root per
                request instead and it degenerates into a second request id.
              </p>
            </Flex>
          </Panel>
        </Flex>

        <Flex gap={6} wrap>
          <Panel title="Other sessions, at render">
            {presence.state === "unmeasured" ? (
              /* NOBODY LOOKED. Never rendered as emptiness — that is the
                 collapse the three states exist to prevent. */
              <Alert tone="crit" title={presence.failure.message}>
                Nobody looked, which is not the same as finding nothing.
                {presence.failure.correlationId
                  ? ` Reference ${presence.failure.correlationId}.`
                  : null}
              </Alert>
            ) : presence.state === "empty" ? (
              <Empty title="Only this one" body="You are not signed in anywhere else." />
            ) : (
              <ul className={s.list}>
                {presence.value.map((session) => (
                  <li key={session.id} className={s.item}>
                    <span className={s.id}>{session.id}</span>
                    <span className={s.meta}>
                      since {new Date(session.createdAt).toISOString().slice(0, 16).replace("T", " ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* The same read, in the browser, through the cache. */}
          <OtherDevices />
        </Flex>

        <Panel title="Forcing a state">
          <Flex direction="column" gap={4}>
            <p className={s.note}>
              The chaos module wraps the transport at the composition root, so
              these work on this screen and on the sign-in form — not only on a
              page written to demonstrate them. Nothing below the root can tell.
            </p>
            <ul className={s.plans}>
              {[
                ["?chaos=GET /auth/sessions=fail:unavailable", "nobody looked, and it is retryable"],
                ["?chaos=GET /auth/sessions=fail:forbidden", "an ANSWER — no retry is offered"],
                ["?chaos=GET /auth/sessions=empty:list", "looked and found nothing"],
                ["?chaos=GET /auth/sessions=latency:2000", "a slow render, and a real skeleton"],
                ["?chaos=GET /auth/me=fail:unauthenticated", "the guard refuses, and you land back at sign-in"],
              ].map(([plan, what]) => (
                <li key={plan} className={s.plan}>
                  <Link href={`/app${plan}`} className={s.id}>{plan}</Link>
                  <span className={s.meta}>{what}</span>
                </li>
              ))}
            </ul>
          </Flex>
        </Panel>

        <Panel title="Where to go next">
          <Flex direction="column" gap={4}>
            <p className={s.note}>
              This screen is the seam, not the destination. Replace it, add
              routes beside it, and delete what you do not need.
            </p>
            <Flex gap={5} wrap>
              <Link href="/kitchen-sink">Kitchen sink</Link>
              <Link href="/probe">Transport probe</Link>
            </Flex>
          </Flex>
        </Panel>
      </Flex>
    </Container>
  );
}
