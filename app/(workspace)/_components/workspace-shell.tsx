"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContextSidebar, NavigationRail, RailLink, RailShell, SidebarNav } from "@/components/shells";
import { DensityToggle, ThemeToggle } from "@/components/chrome";
import { Button } from "@/components/forms";
import { Text } from "@/components/typography";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/overlays";
import { BookOpen, LayoutGrid, Settings, Sparkles } from "@/components/utility";
import { useHydrateRuntime } from "@/lib/runtime/hooks";
import { authHref } from "@/app/_lib/return-to";
import { APP_NAV, COOKBOOK_NAV, workspaceArea } from "../_lib/navigation";
import s from "./workspace-shell.module.css";

export function WorkspaceShell({ children, account }: { children: ReactNode; account?: ReactNode }) {
  useHydrateRuntime();
  const pathname = usePathname();
  const area = workspaceArea(pathname);
  const title = area === "app" ? "Your app" : "Cookbook";
  const groups = area === "app" ? APP_NAV : COOKBOOK_NAV;
  const page = groups.flatMap(group => group.items).find(item => item.href === pathname || (!item.exact && pathname.startsWith(`${item.href}/`)))?.label;

  return <RailShell
    sidebarLabel={`${title} navigation`}
    rail={<NavigationRail label="Flover areas"
      brand={<Link className={s.brand} href="/cookbook" aria-label="Flover home"><Sparkles size={20} aria-hidden="true" /></Link>}>
      <RailLink asChild label="Your app" active={area === "app"}><Link href="/app"><LayoutGrid size={18} aria-hidden="true" /></Link></RailLink>
      <RailLink asChild label="Cookbook" active={area === "cookbook"}><Link href="/cookbook"><BookOpen size={18} aria-hidden="true" /></Link></RailLink>
      <RailLink asChild label="Components" description="Browse the component catalog"><Link href="/kitchen-sink"><Sparkles size={18} aria-hidden="true" /></Link></RailLink>
    </NavigationRail>}
    sidebar={<ContextSidebar title={title}
      description={area === "app" ? "Space for your next product." : "Working examples to build from."}
      footer={<Text size="sm" tone="muted">{area === "app" ? "Flover workspace" : "Flover reference"}</Text>}>
      <SidebarNav groups={groups} current={pathname} label={`${title} pages`}
        renderLink={(item, content) => <Link href={item.href}>{content}</Link>} />
    </ContextSidebar>}
    header={<div className={s.header}>
      <div className={s.location}><Text size="sm" tone="muted">{title}</Text>{page && <><span aria-hidden="true" className={s.separator}>/</span><Text size="sm">{page}</Text></>}</div>
      <div className={s.actions}><Popover>
        <PopoverTrigger asChild><Button intent="ghost" size="icon" aria-label="Appearance"><Settings size={17} aria-hidden="true" /></Button></PopoverTrigger>
        <PopoverContent align="end" aria-label="Appearance preferences" className={s.preferences}>
          <div><Text size="sm" tone="muted">Theme</Text><ThemeToggle /></div>
          <div><Text size="sm" tone="muted">Density</Text><DensityToggle /></div>
          <Text size="sm" tone="quiet">Saved in this browser.</Text>
        </PopoverContent>
      </Popover>
        {account ?? <Button asChild intent="secondary" size="sm"><Link href={authHref("/sign-in", pathname)}>Sign in</Link></Button>}
      </div>
    </div>}
  >{children}</RailShell>;
}
