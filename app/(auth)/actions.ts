"use server";

import { redirect } from "next/navigation";
import { signIn, signUp } from "@/lib/services/session";
import { serverRoot } from "@/app/_lib/root";
import { startSession } from "@/app/_lib/session";
import { toFormState, type FormState } from "@/app/_lib/form-state";

/* The boundary. A `Result` never crosses it — `boundaries.test.ts` fails the
 * build for a "use server" file that returns one — so every path here ends in
 * plain data or in a redirect.
 *
 * # Read once, echo back what is safe
 *
 * React resets an uncontrolled form after its action completes, including when
 * the action refused. Without the echo, being told "that email and password do
 * not match" also empties the email field. The password is never echoed.
 *
 * # `redirect` throws, so it goes last and outside any try
 *
 * It signals control flow by throwing, so a `catch` around it swallows the
 * navigation and reports it as an error — the classic way a working sign-in
 * appears to do nothing. */

const text = (form: FormData, key: string): string => {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
};

export async function signInAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email");
  const root = await serverRoot();

  const session = await signIn(root.clientFor("session"), { email, password: text(form, "password") });
  if (!session.ok) return toFormState(session.error, { values: { email } });

  await startSession(session.value.token);
  redirect("/app");
}

export async function signUpAction(_prev: FormState, form: FormData): Promise<FormState> {
  const name = text(form, "name");
  const email = text(form, "email");
  const root = await serverRoot();

  const session = await signUp(root.clientFor("session"), {
    name, email, password: text(form, "password"),
  });
  if (!session.ok) {
    return toFormState(session.error, {
      values: { name, email },
      /* A taken email is a `conflict` — the form was well-formed and the world
         disagreed with it — and it still belongs on the email input, because
         that is the field the reader has to change. The KIND is the service's
         to decide; the PLACEMENT is this screen's, which is why `scope` is the
         union's tag rather than a restatement of the kind. */
      fieldFor: (failure) => (failure.kind === "conflict" ? "email" : undefined),
    });
  }

  await startSession(session.value.token);
  redirect("/app");
}
