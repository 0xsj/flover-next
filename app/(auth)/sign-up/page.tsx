import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/shells";
import { DEMO_CREDENTIALS, MIN_PASSWORD } from "@/lib/services/session";
import { signUpAction } from "../actions";
import { AuthForm } from "../_components/auth-form";

export const metadata: Metadata = { title: "Create an account · flover" };

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create an account"
      description="Stored in a Map that lives as long as the server process — enough to sign up and then sign in, and gone on the next restart."
      footer={<>Already have one? <Link href="/sign-in">Sign in</Link></>}
    >
      <AuthForm
        action={signUpAction}
        submit="Create account"
        pendingLabel="Creating…"
        fields={[
          { name: "name", label: "Name", autoComplete: "name" },
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          {
            name: "password", label: "Password", type: "password",
            autoComplete: "new-password", hint: `At least ${MIN_PASSWORD} characters.`,
          },
        ]}
        hint={
          <>
            Try <code>{DEMO_CREDENTIALS.email}</code> to see the other refusal: a
            taken address is a <code>conflict</code>, not an invalid field — the
            form was well-formed and the world disagreed with it.
          </>
        }
      />
    </AuthShell>
  );
}
