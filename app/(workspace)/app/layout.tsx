import type { ReactNode } from "react";
import { requireUser } from "@/app/_lib/root";

export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireUser();
  return children;
}
