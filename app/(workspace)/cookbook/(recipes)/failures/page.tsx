import Link from "next/link";
import { Badge, Panel, Table, TBody, Td, Th, THead, Tr } from "@/components/display";
import { Alert } from "@/components/feedback";
import { Container, Flex } from "@/components/layout";
import {
  assertNever, chain, isRetryable, isTransport, retryDelay, rootCause,
  DOMAIN_KINDS, FAILURE_KINDS, TRANSPORT_KINDS,
  type Failure, type FailureKind,
} from "@/lib/kernel";
import { listSessions } from "@/lib/services/session";
import { requireUser, serverRoot } from "@/app/_lib/root";
import { toFormState } from "@/app/_lib/form-state";
import s from "./page.module.css";

/* Every failure kind, forced through the real stack, and rendered exhaustively.
 *
 * Nothing here is simulated at the render. Each link reloads this screen with a
 * chaos plan in the query string; the proxy copies it into a header; the
 * composition root wraps the transport with it; the service maps it through
 * `narrow`; and what arrives is a real `Failure` that took a real round trip and
 * carries real ids. The only thing invented is which kind the server chose.
 *
 * # What it is actually for
 *
 * Two things a screen can only claim until somebody looks:
 *
 *   1. that a caller cannot receive a kind the signature did not promise, and
 *   2. that when the server sends one anyway, nothing is lost.
 *
 * `listSessions` promises `TransportFailure` and no domain kind at all. Force a
 * `not_found` and what arrives is `internal` — folded, because the operation
 * never promised absence — with the original preserved in the cause chain. The
 * "cause" column below is that fold made visible.
 */

const PLAN = (kind: string) => `?chaos=GET /auth/sessions=fail:${kind}`;

/** What a screen is actually obliged to write. Ten branches, no default, and
 *  `assertNever` at the end — so adding a kind to the union breaks the build
 *  here rather than falling through to a shrug. */
function handling(failure: Failure): { verdict: string; surface: string } {
  switch (failure.kind) {
    case "unauthenticated":
      return { verdict: "send them to sign in", surface: "a redirect, not a message" };
    case "forbidden":
      return { verdict: "say no, and do not offer a retry", surface: "an inline refusal" };
    case "rate_limited":
      return { verdict: `wait ${failure.retryAfter ?? "?"}s, then retry`, surface: "a countdown, not an error" };
    case "unavailable":
      return { verdict: "retry with backoff", surface: "keep the last good value on screen" };
    case "timeout":
      return { verdict: "retry with backoff", surface: "a retry control" };
    case "canceled":
      return { verdict: "do nothing at all", surface: "nothing — they asked" };
    case "internal":
      return { verdict: "report it with the reference", surface: "an apology and the id" };
    case "not_found":
      return { verdict: "this read never promised it", surface: "folded to internal" };
    case "invalid":
      return { verdict: "put each message on its field", surface: `${Object.keys(failure.fields).length} field message(s)` };
    case "conflict":
      return { verdict: "the world moved; re-read and re-offer", surface: "a message above the form" };
    default:
      return assertNever(failure, "failure kind");
  }
}

export default async function FailuresPage({
  searchParams,
}: {
  /* Typed by hand rather than with `PageProps<"/cookbook/failures">`: the generated
     route union is produced from the routes that exist, so a new page cannot
     name itself until it has been built once. */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();
  const query = await searchParams;
  const root = await serverRoot();

  const answered = await listSessions(root.clientFor("session"));
  const failure = answered.ok ? null : answered.error;
  const forced = typeof query.chaos === "string" ? query.chaos : null;

  return (
    <Container width="page">
      <Flex direction="column" gap={7}>
        <div>
          <h1 className={s.title}>Failures</h1>
          <p className={s.lead}>
            Every kind, forced through the real stack. Each link reloads this
            screen with a chaos plan; the proxy puts it in a header, the
            composition root wraps the transport with it, and what arrives below
            took a real round trip and carries real ids. The only invented thing
            is which kind the server chose.
          </p>
        </div>

        <Panel title="Force one">
          <Flex direction="column" gap={5}>
            <div>
              <div className={s.groupLabel}>
                Transport — any call can produce these, and no signature may declare them away
              </div>
              <Flex gap={3} wrap>
                {TRANSPORT_KINDS.map((kind) => (
                  <Link key={kind} href={`/cookbook/failures${PLAN(kind)}`} className={s.chip} data-on={forced?.includes(`:${kind}`) || undefined}>
                    {kind}
                  </Link>
                ))}
              </Flex>
            </div>
            <div>
              <div className={s.groupLabel}>
                Domain — an operation says which of these it can produce. This read says NONE
              </div>
              <Flex gap={3} wrap>
                {DOMAIN_KINDS.map((kind) => (
                  <Link key={kind} href={`/cookbook/failures${PLAN(kind)}`} className={s.chip} data-on={forced?.includes(`:${kind}`) || undefined}>
                    {kind}
                  </Link>
                ))}
              </Flex>
            </div>
            <Flex gap={4} wrap>
              <Link href="/cookbook/failures" className={s.chip}>none — succeed</Link>
              <Link href="/cookbook/failures?chaos=GET /auth/sessions=empty:list" className={s.chip}>empty:list</Link>
              <Link href="/cookbook/failures?chaos=GET /auth/sessions=latency:3000" className={s.chip}>latency:3000</Link>
            </Flex>
          </Flex>
        </Panel>

        {failure ? <Anatomy failure={failure} rootCorrelation={root.correlationId} /> : (
          <Alert tone="info" title="The read succeeded">
            {answered.ok ? `${answered.value.length} session(s), and no failure to dissect. Force one above.` : null}
          </Alert>
        )}

        <Panel title="The whole union, and what each branch owes">
          <Table>
            <THead>
              <Tr>
                <Th>kind</Th>
                <Th>half</Th>
                <Th>retryable</Th>
                <Th>a caller must</Th>
              </Tr>
            </THead>
            <TBody>
              {FAILURE_KINDS.map((kind) => (
                <Tr key={kind}>
                  <Td><Link href={`/cookbook/failures${PLAN(kind)}`} className={s.mono}>{kind}</Link></Td>
                  <Td>
                    <Badge tone={(TRANSPORT_KINDS as readonly string[]).includes(kind) ? "accent" : "warn"}>
                      {(TRANSPORT_KINDS as readonly string[]).includes(kind) ? "transport" : "domain"}
                    </Badge>
                  </Td>
                  <Td>{retryVerdict(kind)}</Td>
                  <Td className={s.quiet}>{ADVICE[kind]}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          <p className={s.note}>
            Ten kinds and no eleventh. The switch that renders the panel above
            has a branch for each and <code>assertNever</code> at the end, so
            adding one to the union breaks the build here rather than falling
            through to a shrug at runtime.
          </p>
        </Panel>
      </Flex>
    </Container>
  );
}

const ADVICE: Record<FailureKind, string> = {
  unauthenticated: "send them to sign in",
  forbidden: "say no; never offer a retry for an answer",
  rate_limited: "honour the server's own retry-after",
  unavailable: "retry with backoff, keep the last good value",
  timeout: "retry with backoff",
  canceled: "do nothing — they asked",
  internal: "report it, quoting the reference",
  not_found: "declare it, or it folds to internal",
  invalid: "put each message beside its field",
  conflict: "re-read and re-offer; never retry blindly",
};

const retryVerdict = (kind: FailureKind): string => {
  const sample = { kind, message: "" } as Failure;
  const delay = retryDelay(sample, 0);
  return delay === null ? "no — it is an answer" : `after ${delay}ms`;
};

function Anatomy({ failure, rootCorrelation }: { failure: Failure; rootCorrelation: string }) {
  const decided = handling(failure);
  const causes = chain(failure);
  const form = toFormState(failure);

  return (
    <Flex gap={6} wrap>
      <Panel title="What arrived">
        <dl className={s.facts}>
          <Fact label="kind" value={failure.kind} mono />
          <Fact label="half" value={isTransport(failure) ? "transport — cannot be narrowed away" : "domain — an operation may declare it"} />
          <Fact label="message" value={failure.message} />
          <Fact label="type" value={failure.type ?? "–"} mono />
          <Fact label="status" value={failure.status === undefined ? "–" : String(failure.status)} mono />
          <Fact
            label="requestId"
            value={failure.requestId ?? "–"}
            hint="this attempt. Different on a retry."
            mono
          />
          <Fact
            label="correlationId"
            value={failure.correlationId ?? "–"}
            hint={
              failure.correlationId === rootCorrelation
                ? "this interaction — the same on every call this render made"
                : "this interaction"
            }
            mono
          />
        </dl>
      </Panel>

      <Panel title="What a caller may do about it">
        <dl className={s.facts}>
          <Fact label="retryable" value={isRetryable(failure) ? "yes" : "no — it is an ANSWER"} />
          <Fact
            label="retryDelay"
            value={[0, 1, 2].map((n) => retryDelay(failure, n)).map((d) => (d === null ? "never" : `${d}ms`)).join(" · ")}
            hint="attempt 0 · 1 · 2, and the cache asks exactly this"
            mono
          />
          <Fact label="verdict" value={decided.verdict} />
          <Fact label="surface" value={decided.surface} />
          <Fact label="as form state" value={JSON.stringify(form)} mono />
        </dl>
      </Panel>

      <Panel title={causes.length > 1 ? "Folded — the cause survived" : "Cause chain"}>
        {causes.length > 1 ? (
          <Flex direction="column" gap={4}>
            <p className={s.note}>
              This read promised <strong>no domain kind</strong>, so the one the
              server sent could not be handed to a caller whose type says it
              cannot occur. <code>narrow</code> folded it to{" "}
              <code>internal</code> and kept the original underneath — the
              signature stays true and nothing is lost.
            </p>
            <ol className={s.chain}>
              {causes.map((link, i) => (
                <li key={i} className={s.link}>
                  <span className={s.mono}>{link.kind}</span>
                  <span className={s.quiet}>{link.message}</span>
                </li>
              ))}
            </ol>
            <p className={s.note}>
              <code>rootCause</code> is <span className={s.mono}>{rootCause(failure).kind}</span> — what the
              server actually said, still reachable.
            </p>
          </Flex>
        ) : (
          <p className={s.note}>
            One link: the operation promised this kind, so it arrived unchanged.
            Force a <code>not_found</code>, <code>invalid</code> or{" "}
            <code>conflict</code> to see a fold — this read declares none of them.
          </p>
        )}
      </Panel>
    </Flex>
  );
}

function Fact({ label, value, hint, mono }: { label: string; value: string; hint?: string; mono?: boolean }) {
  return (
    <div className={s.fact}>
      <dt className={s.factLabel}>{label}</dt>
      <dd className={mono ? s.mono : undefined}>
        {value}
        {hint ? <div className={s.quiet}>{hint}</div> : null}
      </dd>
    </div>
  );
}
