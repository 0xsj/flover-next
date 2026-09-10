import type { ReactNode } from "react";
import { QueryProvider } from "@/lib/query";
import { optionalUser } from "@/app/_lib/root";
import { WorkspaceShell } from "./_components/workspace-shell";
import { AccountMenu } from "./_components/account-menu";
import { signOutAction } from "./actions";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const user = await optionalUser();
  return <QueryProvider><WorkspaceShell account={user ? <AccountMenu user={user} onSignOut={signOutAction} /> : undefined}>
    {children}
  </WorkspaceShell></QueryProvider>;
}
