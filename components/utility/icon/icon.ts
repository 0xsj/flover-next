export type { LucideIcon, LucideProps } from "lucide-react";

/* The ONLY file that imports `lucide-react`.
 *
 * A screen imports from `@/components/utility`, never from the library, which
 * is what keeps this list the inventory of icons in use rather than a guess.
 * Adding one is a visible line here instead of an import buried in a component.
 *
 * Alphabetical, so a duplicate is obvious and the diff is a single line. */
export {
  Check,
  ChevronDown,
  History,
  LayoutGrid,
  LoaderCircle,
  LogOut,
  Minus,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  TriangleAlert,
  X,
  Zap,
} from "lucide-react";
