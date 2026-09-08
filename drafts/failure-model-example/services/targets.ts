import {
  absentWhenType, all, err, invalid, narrow, optional,
  type Fails, type Result, type TransportFailure,
} from "@/lib/kernel";
import type { HttpClient } from "@/lib/http";

/* A service is plain async TypeScript. It takes the client as its first
 * argument and never imports one. Still no try/catch, no status code, no
 * header, no URL beyond the endpoint this tier is the only one allowed to name.
 *
 * What the split changes here: a signature is `TransportFailure` plus the
 * DOMAIN kinds this operation can produce, and `narrow` is one line. v2's
 * fifteen-line switch per tier is gone, and so is the defect it carried. */

export type Target = { id: string; name: string; host: string };
export type NewTarget = { name: string; host: string };

/** A read: any transport failure, plus `not_found` for a bad id. */
export type ReadFailure = TransportFailure | Fails<"not_found">;
const asReadFailure = narrow("not_found");

/** A create: any transport failure, plus what a form can be told. */
export type CreateFailure = TransportFailure | Fails<"invalid" | "conflict">;
const asCreateFailure = narrow("invalid", "conflict");

/** `not_found` here means a bad id — the caller asked for something that
 *  should have existed. */
export async function getTarget(client: HttpClient, id: string): Promise<Result<Target, ReadFailure>> {
  return (await client.get<Target>(`/targets/${id}`)).mapErr(asReadFailure);
}

export async function listTargets(client: HttpClient, workspace: string): Promise<Result<Target[], ReadFailure>> {
  return (await client.get<Target[]>("/targets", { params: { workspace } })).mapErr(asReadFailure);
}

/** THREE STATES. Absence is a legitimate answer to "is there a primary
 *  target", so it is not a failure — and the service says HOW the backend
 *  signals absence. A 404 without that type is not absence; it folds to
 *  `internal`, and the screen says "nobody looked" rather than "nothing here". */
export async function findPrimaryTarget(
  client: HttpClient,
  workspace: string,
): Promise<Result<Target | null, TransportFailure>> {
  return optional(
    (await client.get<Target>(`/workspaces/${workspace}/primary-target`)).mapErr(asReadFailure),
    absentWhenType("no_primary_target"),
  );
}

/** Client-side validation produces the SAME shape the server would, so a form
 *  renders one branch, not two. */
export async function createTarget(client: HttpClient, input: NewTarget): Promise<Result<Target, CreateFailure>> {
  const fields: Record<string, string> = {};
  if (!input.name.trim()) fields.name = "A name is required.";
  if (!/^[a-z0-9.-]+$/i.test(input.host)) fields.host = "That is not a hostname.";
  if (Object.keys(fields).length) return err(invalid("Check the form.", fields));

  return (await client.post<Target>("/targets", { body: input })).mapErr(asCreateFailure);
}

/* ── composition ─────────────────────────────────────────────────────────── */

/** INDEPENDENT: fetch in parallel, then collect. Reads left to right. */
export async function targetPage(
  client: HttpClient,
  workspace: string,
  id: string,
): Promise<Result<{ target: Target; siblings: Target[] }, ReadFailure>> {
  const [target, siblings] = await Promise.all([getTarget(client, id), listTargets(client, workspace)]);
  return all([target, siblings]).map(([t, s]) => ({ target: t, siblings: s }));
}

/** DEPENDENT: still the early return, still on purpose. No combinator fixes
 *  the absence of `?`. */
export async function renameTargetsHost(
  client: HttpClient,
  id: string,
  host: string,
): Promise<Result<Target, ReadFailure | Fails<"conflict">>> {
  const current = await getTarget(client, id);
  if (!current.ok) return current;

  return (await client.patch<Target>(`/targets/${id}`, {
    body: { name: current.value.name, host },
  })).mapErr(narrow("not_found", "conflict"));
}

/** A service may also succeed with nothing, and that is not a failure. */
export async function deleteTarget(client: HttpClient, id: string): Promise<Result<void, ReadFailure>> {
  return (await client.delete<void>(`/targets/${id}`)).mapErr(asReadFailure).map(() => undefined);
}
