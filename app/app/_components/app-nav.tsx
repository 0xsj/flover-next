"use client";

import { usePathname } from "next/navigation";
import { SidebarNav } from "@/components/shells";
import { NAV } from "./nav";

/* The router lives here and nowhere else.
 *
 * `SidebarNav` takes `current` as a prop rather than reading the route, for the
 * reason `NavLink` gives: a router is the one thing that cannot be shared with
 * the Solid and Svelte siblings. So the design system stays portable and this
 * file — which is framework-specific anyway, being a route's own component —
 * answers the question.
 *
 * # It IMPORTS the nav rather than being handed it
 *
 * It used to take `groups` as a prop, passed down from the layout. That layout
 * is a server component and the nav carries icon COMPONENTS, so the props were
 * functions crossing the RSC boundary:
 *
 *     Functions cannot be passed directly to Client Components
 *       {$$typeof: …, render: function Settings}
 *
 * A component reference is a function, and functions do not serialise. Static
 * configuration a client component needs should be IMPORTED BY IT, not handed
 * to it — then it is bundled on the client and never crosses anything. The prop
 * was buying nothing: the nav is a constant, and the layout had no say in it. */
export function AppNav() {
  return <SidebarNav groups={NAV} current={usePathname()} label="Application" />;
}
