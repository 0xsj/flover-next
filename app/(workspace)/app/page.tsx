import type { Metadata } from "next";
import { Container } from "@/components/layout";
import { PageHeader } from "@/components/patterns";
import { requireUser } from "@/app/_lib/root";

export const metadata: Metadata = { title: "Home · flover" };

export default async function AppPage() {
  await requireUser();
  return <Container width="page"><PageHeader title="Home" /></Container>;
}
