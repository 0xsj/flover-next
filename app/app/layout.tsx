import type { Metadata } from "next";
import { DensityToggle, ThemeToggle } from "@/components/chrome";
import { AppShell } from "@/components/shells";
import { QueryProvider } from "@/lib/query";
import { requireUser } from "@/app/_lib/root";
import { signOutAction } from "./actions";
import { AccountMenu } from "./_components/account-menu";
import { AppNav } from "./_components/app-nav";

export const metadata: Metadata = { title: "flover" };

/* The guard, and it asks rather than assumes.
 *
 * `requireUser` calls the session service instead of checking that a cookie
 * exists: a revoked, expired or invented token still arrives as a cookie, and a
 * guard that only looks for presence admits all three. It redirects by throwing,
 * so everything below this line runs with a real user.
 *
 * One call per render, deduplicated by React's `cache` — which is also what
 * gives the layout and the page one root, and therefore one correlation id. */
export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const user = await requireUser();

  return (
    /* The cache lives inside the guard, so nothing can subscribe to a query
       before there is a session to answer it. */
    <QueryProvider>
    <AppShell
      /* No props: the nav carries icon COMPONENTS, and a component reference
         is a function that cannot cross into a client component. It imports
         its own configuration instead. */
      nav={<AppNav />}
      actions={
        <>
          <ThemeToggle />
          <DensityToggle />
          {/* A server action crossing into a client component: a reference the
              runtime can call, not a function being serialised. */}
          <AccountMenu user={user} onSignOut={signOutAction} />
        </>
      }
    >
      {children}
    </AppShell>
    </QueryProvider>
  );
}
