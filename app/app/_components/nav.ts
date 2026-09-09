import {
  History, LayoutGrid, Settings, Sparkles, TriangleAlert, Zap,
} from "@/components/utility";
import type { NavGroup } from "@/components/shells";

/** The information architecture, as data, in one place.
 *
 *  A template's IA is a placeholder by definition — the point is the shape, and
 *  that a product edits one file rather than hunting links through markup. */
export const NAV: readonly NavGroup[] = [
  {
    items: [
      { href: "/app", label: "Overview", icon: LayoutGrid },
      { href: "/app/activity", label: "Activity", icon: History },
    ],
  },
  {
    label: "Lab",
    items: [
      { href: "/app/chaos", label: "Chaos", icon: Zap },
      { href: "/app/failures", label: "Failures", icon: TriangleAlert },
    ],
  },
  {
    label: "Reference",
    items: [
      { href: "/kitchen-sink", label: "Kitchen sink", icon: Sparkles },
      { href: "/probe", label: "Transport probe", icon: Settings },
    ],
  },
];
