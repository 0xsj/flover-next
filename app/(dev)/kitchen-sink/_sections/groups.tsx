import { PlannedSection, type Planned } from "../_components/planned";

/* The remaining component groups, as directories with a stated job.
 *
 * A group listed and empty says "this is where these go and none exist yet".
 * A group absent says "we decided against it", which is a different claim and
 * not the one being made. Each entry names the component's JOB rather than its
 * markup, because the job is the part that survives being rebuilt. */

const feedback: Planned[] = [
  { name: "Alert", note: "a message about the page, not about a field" },
  { name: "Skeleton", note: "the loading state, sized to what is coming" },
];

const layout: Planned[] = [
  { name: "Separator", note: "a divider that is decorative to a reader unless it is not" },
];

const navigation: Planned[] = [
  { name: "Tabs", note: "one panel at a time, with roving focus" },
  { name: "Breadcrumb", note: "where this is, with the current page marked as current" },
  { name: "NavLink", note: "a link that knows whether it is the active route" },
];

const overlays: Planned[] = [
  { name: "Dialog", note: "focus trapped, escape closes, focus restored to the trigger" },
  { name: "AlertDialog", note: "a dialog that cannot be dismissed by accident" },
  { name: "Popover", note: "positioned, dismissible, and not a tooltip" },
  { name: "DropdownMenu", note: "a menu with typeahead and roving focus" },
  { name: "Tooltip", note: "a hint for a control that already has a name" },
];

const utility: Planned[] = [
  { name: "Icon", note: "one file of named re-exports, so the set in use stays countable", built: true },
  { name: "AccessibleIcon", note: "an icon that carries meaning gets a name; a decorative one is hidden" },
  { name: "VisuallyHidden", note: "text for a reader and not for the screen" },
  { name: "Portal", note: "render elsewhere in the tree without leaving the React one" },
];

const chrome: Planned[] = [
  { name: "ThemeToggle", note: "the three theme states, over lib/runtime" },
  { name: "DensityToggle", note: "the token override, over lib/runtime" },
  { name: "Mark", note: "the wordmark, in one place" },
];

export const FeedbackSection = () => (
  <PlannedSection
    id="feedback" title="Feedback" components={feedback}
    blurb="Messages about the page rather than about a field. A field's error belongs to its Field; anything wider belongs here."
  />
);

export const LayoutSection = () => (
  <PlannedSection
    id="layout" title="Layout" components={layout}
    blurb="Deliberately almost empty. Arrangement is a screen's own business, expressed where the screen is — a layout component library is how a design system starts owning decisions it cannot see."
  />
);

export const NavigationSection = () => (
  <PlannedSection
    id="navigation" title="Navigation" components={navigation}
    blurb="Moving between places, and saying which place you are in. Every one of these has a keyboard contract that is easy to omit and invisible once omitted."
  />
);

export const OverlaysSection = () => (
  <PlannedSection
    id="overlays" title="Overlays" components={overlays}
    blurb="The one group the testing decision commits to interaction tests: focus trapped, escape closes, scroll locked, focus restored to the trigger. Those break silently on refactor and are invisible to the person who broke them."
  />
);

export const UtilitySection = () => (
  <PlannedSection
    id="utility" title="Utility" components={utility}
    blurb="Not components so much as the small mechanisms other components need. The icon re-export file is the only one built, and it is the reason the set of icons in use is countable."
  />
);

export const ChromeSection = () => (
  <PlannedSection
    id="chrome" title="Chrome" components={chrome}
    blurb="The shell around a screen. These are the callers lib/runtime was built for — the theme and density controls in this page's header are a route-local stand-in until they land here."
  />
);
