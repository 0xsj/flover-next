import { assertNever, isTransport, presenceOf } from "@/lib/kernel";
import { clientFor } from "../root";
import { findPrimaryTarget, getTarget, listTargets } from "../services/targets";
import { Notice, TransportProblem } from "./problem";

/* Server components. No try/catch, no error boundary, no throw — the failure
 * arrived in the return type, so handling it is ordinary branching.
 *
 * Note the client comes from the composition root. A screen never builds one:
 * that is the rule that keeps `services` free of a transport decision, and it
 * is why swapping to a real backend is one environment variable. */

export async function TargetsScreen({ workspace }: { workspace: string }) {
  const targets = await listTargets(clientFor("session-token"), workspace);

  if (!targets.ok) {
    // One domain kind on a read, and the transport surface is delegated.
    return targets.error.kind === "not_found"
      ? <Notice tone="quiet">That workspace does not exist.</Notice>
      : <TransportProblem failure={targets.error} />;
  }

  // Empty is not a failure and never was. It is the shape of the answer.
  if (targets.value.length === 0) return <Notice tone="quiet">No targets yet.</Notice>;

  return <ul>{targets.value.map((t) => <li key={t.id}>{t.name} — {t.host}</li>)}</ul>;
}

/** A detail screen. The switch has ONE domain case because `getTarget` promised
 *  one; writing `case "invalid"` here does not compile. */
export async function TargetScreen({ id }: { id: string }) {
  const target = await getTarget(clientFor("session-token"), id);

  return target.match({
    ok: (t) => <article><h1>{t.name}</h1><p>{t.host}</p></article>,
    err: (f) => {
      if (isTransport(f)) return <TransportProblem failure={f} />;
      switch (f.kind) {
        case "not_found": return <Notice tone="quiet">That target does not exist.</Notice>;
        default:          return assertNever(f, "read failure");
      }
    },
  });
}

/** Three states, kept apart. `optional` removed `not_found` from the failure
 *  type, so `unmeasured` can only be a transport failure — and a 404 the
 *  service did not recognise as absence lands there rather than in `empty`. */
export async function PrimaryTarget({ workspace }: { workspace: string }) {
  const presence = presenceOf(await findPrimaryTarget(clientFor("session-token"), workspace));

  switch (presence.state) {
    case "found":      return <p>Primary: {presence.value.name}</p>;
    case "empty":      return <p>No primary target has been chosen.</p>;
    // NOT an em-dash with no explanation. "Nobody looked" is its own answer.
    case "unmeasured": return <TransportProblem failure={presence.failure} />;
    default:           return assertNever(presence, "presence state");
  }
}
