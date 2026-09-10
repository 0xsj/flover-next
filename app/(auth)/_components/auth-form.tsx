"use client";

import { useActionState } from "react";
import { Alert } from "@/components/feedback";
import { Button, Field, Input } from "@/components/forms";
import { IDLE, type FormState } from "@/app/_lib/form-state";
import s from "./auth-form.module.css";

export type AuthFieldSpec = {
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  hint?: string;
};

export type AuthFormProps = {
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  fields: readonly AuthFieldSpec[];
  submit: string;
  pendingLabel: string;
  returnTo: string;
  hint?: React.ReactNode;
};

/* Both doors, one form.
 *
 * # The two refusals are rendered in two places, and that is the point
 *
 *     scope: "fields"   beside the input named in it, and `fields` is
 *                       required on that arm rather than optional.
 *     scope: "form"     above the form. "That email and password do not match"
 *                       is not a fact about the password field — putting it
 *                       there tells the reader which half was wrong, which is
 *                       the one thing a sign-in form must not do.
 *
 * The two are arms of a union, so they cannot both be taken and neither can be
 * missing. Which one a refusal lands in is the ACTION's decision — sign-up puts
 * a taken email on the email field even though its kind is `conflict`.
 *
 * # Values are re-filled from the state, not from the DOM
 *
 * React resets an uncontrolled form after its action completes, refusal
 * included, so `defaultValue` has to come back from the server or the email a
 * reader just typed vanishes as they are told to try again. */
export function AuthForm({ action, fields, submit, pendingLabel, hint, returnTo }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, IDLE);

  /* One read of the tag, and the two branches below cannot both be taken. That
     is the whole reason this is a union: previously both were optional, so a
     state with a form message AND field messages compiled, and nothing said
     which was supposed to win. */
  const formMessage = state.status === "error" && state.scope === "form" ? state : null;
  const fieldMessages = state.status === "error" && state.scope === "fields" ? state.fields : null;
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form action={formAction} className={s.form} noValidate>
      <input type="hidden" name="returnTo" value={returnTo} />
      {formMessage ? (
        /* `live` because it appears in response to something the reader did.
           Most alerts are rendered with the page and must not be live; this one
           is news by construction. */
        <Alert tone="crit" live="assertive" title={formMessage.message}>
          {formMessage.retryAfter
            ? `Try again in ${formMessage.retryAfter} seconds.`
            : formMessage.kind === "rate_limited"
              ? "Even the right password will be refused until then."
              : null}
        </Alert>
      ) : null}

      <div className={s.fields}>
        {fields.map((field) => (
          <Field
            key={field.name}
            label={field.label}
            hint={field.hint}
            error={fieldMessages?.[field.name]}
            required
          >
            {(control) => (
              <Input
                {...control}
                name={field.name}
                type={field.type ?? "text"}
                autoComplete={field.autoComplete}
                defaultValue={values?.[field.name]}
              />
            )}
          </Field>
        ))}
      </div>

      <Button type="submit" intent="primary" size="lg" loading={pending} className={s.submit}>
        {pending ? pendingLabel : submit}
      </Button>

      {hint ? <p className={s.hint}>{hint}</p> : null}
    </form>
  );
}
