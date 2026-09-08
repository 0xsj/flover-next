"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { asFailure, isTransport, unwrap, type Failure } from "@/lib/kernel";
import { clientFor } from "../root";
import { keys } from "../query/keys";
import { createTarget, type NewTarget, type Target } from "../services/targets";
import { FieldErrors, TransportProblem } from "./problem";

/* A write, and the case the whole design is really for.
 *
 * `createTarget` promises `invalid | conflict` on top of transport. So this
 * form has exactly THREE branches to write, and the compiler knows it:
 *
 *   invalid    → messages against the inputs
 *   conflict   → someone else got there first; refetch and let them decide
 *   transport  → the shared surface
 *
 * Writing a case for `not_found` here does not compile. */

export function NewTargetForm({ workspace }: { workspace: string }) {
  const cache = useQueryClient();
  const [failure, setFailure] = useState<Failure | null>(null);

  const create = useMutation({
    mutationFn: async (input: NewTarget): Promise<Target> =>
      unwrap(await createTarget(clientFor("session-token"), input)),

    onMutate: () => setFailure(null),

    // The cache rejected with an AppError; recover the value and keep it.
    onError: (error) => setFailure(asFailure(error)),

    onSuccess: () => {
      // Prefix match: this reaches every targets query in the workspace.
      void cache.invalidateQueries({ queryKey: keys.targets.all(workspace) });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        create.mutate({ name: String(form.get("name") ?? ""), host: String(form.get("host") ?? "") });
      }}
    >
      <input name="name" aria-label="Name" aria-invalid={fieldOf(failure, "name") ? true : undefined} />
      <input name="host" aria-label="Host" aria-invalid={fieldOf(failure, "host") ? true : undefined} />

      <button type="submit" disabled={create.isPending}>
        {create.isPending ? "Creating…" : "Create target"}
      </button>

      {failure ? <FormProblem failure={failure} /> : null}
    </form>
  );
}

/** Three branches, and no others are reachable. */
function FormProblem({ failure }: { failure: Failure }) {
  if (isTransport(failure)) return <TransportProblem failure={failure} />;
  switch (failure.kind) {
    case "invalid":
      // `fields` exists on this branch and only this one.
      return <FieldErrors fields={failure.fields} />;
    case "conflict":
      return <p role="alert">{failure.message} Reload to see the current list.</p>;
    default:
      // `not_found` is unreachable for a create, but this component takes an
      // unnarrowed Failure, so the fallthrough stays honest rather than
      // pretending the type is narrower than it is.
      return <p role="alert">{failure.message}</p>;
  }
}

/** Per-field wiring, so an input can mark itself invalid. Reads only from a
 *  kind that has fields — anything else has nothing to say about an input. */
function fieldOf(failure: Failure | null, name: string): string | undefined {
  return failure?.kind === "invalid" ? failure.fields[name] : undefined;
}
