import { notFound } from "next/navigation";
import { ShellPreview } from "../_components/shell-preview";

type Props = { params: Promise<{ variant: string }>; searchParams: Promise<{ section?: string; page?: string }> };
export default async function ShellPreviewPage({ params, searchParams }: Props) {
  const { variant } = await params;
  if (variant !== "standard" && variant !== "rail" && variant !== "auth") notFound();
  const query = await searchParams;
  return <ShellPreview variant={variant} section={query.section} page={query.page} />;
}
