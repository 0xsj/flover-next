import { redirect } from "next/navigation";
import { optionalUser } from "@/app/_lib/root";

/* The other half of the guard.
 *
 * `(app)` refuses anyone without a session; this refuses anyone WITH one. A
 * sign-in form shown to somebody already signed in is a dead end — submitting
 * it works and appears to do nothing, because they were already where it sends
 * them. */
export default async function AuthLayout({ children }: LayoutProps<"/">) {
  if (await optionalUser()) redirect("/app");
  return children;
}
