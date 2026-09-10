import { NavLink } from "@/components/navigation";
import type { LucideIcon } from "@/components/utility";
import type { ReactElement, ReactNode } from "react";
import s from "./sidebar-nav.module.css";

export type NavItem = {
  href: string;
  label: string;
  icon?: LucideIcon;
  /** Section landing pages should not also be current on every child page. */
  exact?: boolean;
};

export type NavGroup = {
  /** Announced before the links in it, so a reader knows which part of the app
   *  they are moving inside. Omit for a single ungrouped list. */
  label?: string;
  items: readonly NavItem[];
};

export type SidebarNavProps = {
  groups: readonly NavGroup[];
  /** The path the reader is already on.
   *
   *  A PROP, for the reason `NavLink` gives: reading the current route needs a
   *  router, and the router is the one thing that differs between this template
   *  and its siblings. The caller is framework-specific anyway; this stays
   *  portable. */
  current?: string;
  /** Announced before the whole thing. Two navigations on a page that are both
   *  called "navigation" are two things a reader cannot tell apart. */
  label?: string;
  /** Supply the framework's link locally in its client binding. */
  renderLink?: (item: NavItem, content: ReactNode) => ReactElement;
};

/** A link is current if it IS the path, or if the path is inside it — so a
 *  detail route still marks the section it belongs to. `/` is exempt, or it
 *  would be current everywhere. */
const isCurrent = (href: string, current?: string): boolean => {
  if (!current) return false;
  if (href === current) return true;
  return href !== "/" && current.startsWith(`${href}/`);
};

/** The sidebar's links, grouped.
 *
 *  A `<nav>` per shell, not per group: nested landmarks are a reader's problem,
 *  not a structure. Groups are headed lists inside the one landmark. */
export function SidebarNav({ groups, current, label = "Sections", renderLink }: SidebarNavProps) {
  return (
    <nav aria-label={label} className={s.nav}>
      {groups.map((group, i) => (
        <div key={group.label ?? i} className={s.group}>
          {group.label ? <div className={s.groupLabel}>{group.label}</div> : null}
          {group.items.map((item) => {
            const { href, label: text, icon: Icon, exact } = item;
            const content = <>{Icon ? <Icon size={15} className={s.icon} aria-hidden="true" /> : null}{text}</>;
            return (
            <NavLink
              key={href}
              href={href}
              asChild={Boolean(renderLink)}
              active={exact ? href === current : isCurrent(href, current)}
              className={s.item}
            >
              {renderLink ? renderLink(item, content) : content}
            </NavLink>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
