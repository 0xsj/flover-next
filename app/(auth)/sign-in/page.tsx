import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { optionalUser } from "@/app/_lib/root";
import { authHref, safeReturnTo } from "@/app/_lib/return-to";
import { AuthShell } from "@/components/shells";
import { DEMO_CREDENTIALS } from "@/lib/services/session";
import { signInAction } from "../actions";
import { AuthForm } from "../_components/auth-form";

export const metadata: Metadata = { title: "Sign in · flover" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const returnTo = safeReturnTo((await searchParams).returnTo);
  // Pages receive the destination on every navigation; layouts do not receive searchParams.
  if (await optionalUser()) redirect(returnTo);
  return (
    <AuthShell
      title="Sign in"
      description="No server is configured, so this runs against the in-memory adapter — the same code path a real one would take."
      footer={<>New here? <Link href={authHref("/sign-up", returnTo)}>Create an account</Link>{" · "}<Link href="/cookbook">Cookbook</Link></>}
    >
      <AuthForm
        action={signInAction}
        returnTo={returnTo}
        submit="Sign in"
        pendingLabel="Signing in…"
        fields={[
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
        ]}
        hint={
          <>
            The fixture ships one account: <code>{DEMO_CREDENTIALS.email}</code>{" "}
            / <code>{DEMO_CREDENTIALS.password}</code>. Get it wrong five times
            and it starts refusing with a retry-after, which is a refusal worth
            seeing rendered.
          </>
        }
      />
    </AuthShell>
  );
}
