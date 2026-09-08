"use server";

import { type Failure } from "@/lib/kernel";
import { clientFor } from "../root";
import { createTarget, type Target } from "../services/targets";

/* A Server Action. A form needs the failure BACK — per-field messages against
 * its own inputs — so the action returns what it has, as data.
 *
 * Note what is NOT returned: the Result. It is a class now, and its methods do
 * not survive the boundary. The boundary shape is explicit form state carrying
 * the Failure, which is plain data and serialises end to end. */

export type FormState =
  | { status: "idle" }
  | { status: "ok"; target: Target }
  | { status: "failed"; failure: Failure };

export async function createTargetAction(_previous: FormState, form: FormData): Promise<FormState> {
  const created = await createTarget(clientFor("session-token"), {
    name: String(form.get("name") ?? ""),
    host: String(form.get("host") ?? ""),
  });

  return created.match<FormState>({
    ok: (target) => ({ status: "ok", target }),
    err: (failure) => ({ status: "failed", failure }),
  });
}
