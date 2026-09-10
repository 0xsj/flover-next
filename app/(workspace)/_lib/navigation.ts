import { BookOpen, History, LayoutGrid, Network, TriangleAlert, Zap } from "@/components/utility";
import type { NavGroup } from "@/components/shells";

export const RECIPES = [
  { href: "/cookbook/dashboard", label: "Dashboard", icon: LayoutGrid, description: "Session data, server and cached reads, and an optimistic update.", category: "Working examples" },
  { href: "/cookbook/activity", label: "Activity", icon: History, description: "A working collection with filtering, pagination, and real empty states.", category: "Working examples" },
  { href: "/cookbook/editable-dashboard", label: "Editable dashboard", icon: LayoutGrid, description: "Arrange widgets with drag, resize, and keyboard controls. Save a layout in this browser.", category: "Interactive workspaces" },
  { href: "/cookbook/canvas", label: "Canvas", icon: Network, description: "Explore a freeform workspace with pan, zoom, movable items, and an inspector.", category: "Interactive workspaces" },
  { href: "/cookbook/live-updates", label: "Live updates", icon: Zap, description: "Targeted refresh, event bursts, and catching up after a disconnected stream.", category: "Interactive workspaces" },
  { href: "/cookbook/chaos", label: "Chaos", icon: Zap, description: "Apply failures, empty responses, and latency to the working examples.", category: "Failure handling" },
  { href: "/cookbook/failures", label: "Failures", icon: TriangleAlert, description: "Follow a failure through its kind, cause chain, and recovery policy.", category: "Failure handling" },
] as const;

export const APP_NAV: readonly NavGroup[] = [{ items: [{ href: "/app", label: "Home", icon: LayoutGrid, exact: true }] }];
export const COOKBOOK_NAV: readonly NavGroup[] = [
  { items: [{ href: "/cookbook", label: "Start here", icon: BookOpen, exact: true }] },
  ...["Working examples", "Interactive workspaces", "Failure handling"].map(label => ({ label, items: RECIPES.filter(recipe => recipe.category === label) })),
];

export function workspaceArea(pathname: string): "app" | "cookbook" {
  return pathname === "/app" || pathname.startsWith("/app/") ? "app" : "cookbook";
}
