import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATALOG } from "../_lib/catalog";
import { SECTION_COMPONENTS } from "../_sections/registry";

export function generateStaticParams() { return CATALOG.map(({ id }) => ({ section: id })); }
export async function generateMetadata({ params }: PageProps<"/kitchen-sink/[section]">): Promise<Metadata> {
  const { section } = await params;
  const entry = CATALOG.find((item) => item.id === section);
  return { title: entry ? `${entry.label} · Flover kitchen sink` : "Category not found" };
}
export default async function CategoryPage({ params }: PageProps<"/kitchen-sink/[section]">) {
  const { section } = await params;
  const entry = CATALOG.find((item) => item.id === section);
  if (!entry) notFound();
  const Component = SECTION_COMPONENTS[entry.id];
  return <Component />;
}
