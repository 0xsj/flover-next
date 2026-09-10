"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/lib/services/session";
import { serverRoot } from "@/app/_lib/root";
import { endSession } from "@/app/_lib/session";

/** Two halves, and the local one is the one that must happen.
 *
 *  Ending the session on the server and forgetting the token in this browser
 *  are separate operations and either can fail without the other. If the server
 *  call fails, the cookie is cleared anyway: a sign-out that refuses to sign
 *  the reader out because the network was down is the wrong failure to have. */
export async function signOutAction(): Promise<void> {
  const root = await serverRoot();
  await signOut(root.clientFor("session"));
  await endSession();
  redirect("/");
}
