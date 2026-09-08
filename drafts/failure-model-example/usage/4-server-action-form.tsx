"use client";

import { useActionState } from "react";
import { isTransport, type Failure } from "@/lib/kernel";
import { createTargetAction, type FormState } from "./5-server-action";
import { FieldErrors, TransportProblem } from "./problem";

/* The same form as a Server Action. Worth showing both, because the failure
 * takes a DIFFERENT route and the design has to survive it.
 *
 * A throw here would send the failure to an error boundary, replacing the form
 * with an error page and losing what the user typed. So the action RETURNS the
 * value it already had — and it crosses the boundary because a Failure is plain
 * data.
 *
 * What does NOT cross: the Result itself. It is a class; its methods do not
 * survive. The action unwraps it into an explicit form state first. */

export function NewTargetActionForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    createTargetAction,
    { status: "idle" },
  );

  const failure = state.status === "failed" ? state.failure : null;

  return (
    <form action={action}>
      <input name="name" aria-label="Name" aria-invalid={fieldOf(failure, "name") ? true : undefined} />
      <input name="host" aria-label="Host" aria-invalid={fieldOf(failure, "host") ? true : undefined} />

      <button type="submit" disabled={pending}>{pending ? "Creating…" : "Create target"}</button>

      {state.status === "ok" ? <p role="status">Created {state.target.name}.</p> : null}
      {failure ? <ActionProblem failure={failure} /> : null}
    </form>
  );
}

function ActionProblem({ failure }: { failure: Failure }) {
  if (isTransport(failure)) return <TransportProblem failure={failure} />;
  return failure.kind === "invalid"
    ? <FieldErrors fields={failure.fields} />
    : <p role="alert">{failure.message}</p>;
}

function fieldOf(failure: Failure | null, name: string): string | undefined {
  return failure?.kind === "invalid" ? failure.fields[name] : undefined;
}
