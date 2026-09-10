"use client";

import Link from "next/link";
import { AppShell, AuthShell, RailShell, ContextSidebar, NavigationRail, RailLink, SidebarNav } from "@/components/shells";
import { ThemeToggle } from "@/components/chrome";
import { LayoutGrid, Network, Settings, Sparkles } from "@/components/utility";
import { Badge, Panel, Stat, DescriptionList, DescriptionItem, Avatar } from "@/components/display";
import { Button, Field, Input } from "@/components/forms";
import { PageHeader } from "@/components/patterns";
import { Text } from "@/components/typography";
import s from "./shell-preview.module.css";
import { usePreviewPreferences } from "./use-preview-preferences";

const SECTIONS = [
  { id: "workspace", label: "Workspace", description: "Projects, people, and recent work", Icon: LayoutGrid, pages: ["Overview", "Projects", "Activity"] },
  { id: "reports", label: "Reports", description: "Results, exports, and shared reports", Icon: Network, pages: ["Summary", "Exports"] },
  { id: "settings", label: "Settings", description: "Workspace preferences and membership", Icon: Settings, pages: ["General", "Members"] },
] as const;
export function ShellPreview({ variant, section, page }: { variant: "standard" | "rail" | "auth"; section?: string; page?: string }) {
  usePreviewPreferences();
  const current = SECTIONS.find((item) => item.id === section) ?? SECTIONS[0];
  const currentPage = current.pages.find((item) => item.toLowerCase() === page) ?? current.pages[0];
  const href = (id: string, name: string) => `/shell-preview/${variant}?section=${id}&page=${name.toLowerCase()}`;
  const groups = [{ items: current.pages.map((name) => ({ label: name, href: href(current.id, name) })) }];
  const navigation = <SidebarNav groups={groups} current={href(current.id, currentPage)} label={`${current.label} pages`} />;
  const account = <div className={s.account}><Avatar name="Ada Lovelace" size="sm" /><div><Text size="sm">Ada Lovelace</Text><Text size="sm" tone="quiet">Sample workspace</Text></div></div>;
  const header = <div className={s.header}><Text size="sm" tone="muted">{current.label} / {currentPage}</Text><ThemeToggle /></div>;
  const content = <div className={s.content}>
    <PageHeader title={currentPage} description={`${current.description}. This preview uses illustrative data.`} actions={<Badge glyph="●" tone="accent">Ready</Badge>} />
    <div className={s.metrics}><Stat label="Projects" value={12} /><Stat label="Members" value={8} /><Stat label="Open requests" value={0} /></div>
    <Panel title={`${currentPage} details`}><DescriptionList><DescriptionItem term="Workspace">Northstar</DescriptionItem><DescriptionItem term="Owner">Ada Lovelace</DescriptionItem><DescriptionItem term="Navigation">{variant === "rail" ? "Icon rail → section pages → content" : "Header → sidebar → content"}</DescriptionItem></DescriptionList></Panel>
    <Text size="sm" tone="quiet">Use the navigation to move between preview pages. Resize the window to try the compact layout.</Text>
  </div>;
  if (variant === "auth") return <AuthShell title="Sign in" description="An isolated shell preview." footer={<Link href="/kitchen-sink/shells" target="_top">Back to the catalog</Link>}>
    <div className={s.content}><Field label="Email">{(control) => <Input {...control} type="email" placeholder="you@example.com" />}</Field><Field label="Password">{(control) => <Input {...control} type="password" />}</Field><Button asChild intent="primary"><Link href="/sign-in" target="_top">Open sign-in screen</Link></Button></div>
  </AuthShell>;
  if (variant === "standard") return <AppShell nav={<ContextSidebar title="Northstar" description="Sample workspace" footer={account}><SidebarNav groups={SECTIONS.map((item) => ({ label: item.label, items: item.pages.map((name) => ({ label: name, href: href(item.id, name) })) }))} current={href(current.id, currentPage)} /></ContextSidebar>} actions={<ThemeToggle />}>{content}</AppShell>;
  return <RailShell header={header}
    rail={<NavigationRail brand={<Link href={href("workspace", "Overview")} aria-label="Flover workspace"><Sparkles size={21} aria-hidden="true" /></Link>}
      footer={<RailLink href="/kitchen-sink/shells" target="_top" label="Component catalog" description="Return to the Flover shell examples"><Sparkles size={17} aria-hidden="true" /></RailLink>}>
      {SECTIONS.map((item) => <RailLink key={item.id} asChild label={item.label} description={item.description} active={current.id === item.id}><Link href={href(item.id, item.pages[0])}><item.Icon size={17} aria-hidden="true" /></Link></RailLink>)}
    </NavigationRail>}
    sidebar={<ContextSidebar title={current.label} description={current.description} footer={account}>{navigation}</ContextSidebar>}>
    {content}
  </RailShell>;
}
