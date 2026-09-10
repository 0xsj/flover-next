import type { ReactNode } from "react";
import { requireUser } from "@/app/_lib/root";

export default async function RecipeLayout({ children }: { children: ReactNode }) {
  await requireUser();
  return children;
}
