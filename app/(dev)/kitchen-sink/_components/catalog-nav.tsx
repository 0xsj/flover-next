"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/forms";
import { Menu, X } from "@/components/utility";
import { cn } from "@/lib/kernel";
import { CATALOG, CATALOG_GROUPS } from "../_lib/catalog";
import s from "./sink.module.css";

function Navigation({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  return <aside className={s.rail} onKeyDown={(event) => {
    if (event.key === "Escape" && open) { setOpen(false); event.currentTarget.querySelector<HTMLButtonElement>("button")?.focus(); }
  }}>
    <Button intent="secondary" className={s.mobileNavToggle} aria-expanded={open} aria-controls="catalog-navigation" onClick={() => setOpen(!open)}>
      {open ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />} Browse components
    </Button>
    <nav id="catalog-navigation" aria-label="Component catalog" className={s.catalogNav} data-open={open || undefined}>
      <Link className={cn(s.catalogLink, pathname === "/kitchen-sink" && s.catalogActive)} href="/kitchen-sink" aria-current={pathname === "/kitchen-sink" ? "page" : undefined} onClick={() => setOpen(false)}>Overview</Link>
      {CATALOG_GROUPS.map((group) => <div key={group} className={s.catalogGroup}>
        <p className={s.caseSection}>{group}</p>
        {CATALOG.filter((entry) => entry.group === group).map((entry) => {
          const href = `/kitchen-sink/${entry.id}`;
          return <Link key={entry.id} href={href} className={cn(s.catalogLink, pathname === href && s.catalogActive)} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}>{entry.label}</Link>;
        })}
      </div>)}
    </nav>
  </aside>;
}
export function CatalogNav() {
  const pathname = usePathname();
  return <Navigation key={pathname} pathname={pathname} />;
}
