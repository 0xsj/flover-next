"use client";

import Link from "next/link";
import { usePreviewPreferences } from "../../shell-preview/_components/use-preview-preferences";
import { Button } from "@/components/forms";
import s from "./sink.module.css";

export function ShellExample({ variant, title }: { variant: "standard" | "rail" | "auth"; title: string }) {
  usePreviewPreferences();
  return <><iframe className={s.shellPreview} src={`/shell-preview/${variant}`} title={title} loading="lazy" />
    <div><Button asChild size="sm" intent="secondary"><Link href={`/shell-preview/${variant}`}>Open full-page preview</Link></Button></div>
  </>;
}
