# flover-next

An opinionated Next.js starter with a token-based design system, composable UI,
explicit transport boundaries, and an in-memory backend adapter. It is a template
to build from, with working examples and protocols you can adopt or remove.

## Run locally

Use the Node version in `.nvmrc`, then:

```sh
npm ci
npm run dev
```

Open [the cookbook](http://localhost:3000/cookbook) for the working examples;
`/` redirects there. [Your app](http://localhost:3000/app) is a fresh, authenticated
canvas using the same rail shell. The [kitchen sink](http://localhost:3000/kitchen-sink)
remains the component catalog.

## App and cookbook

The rail switches between the app, cookbook, and component catalog. The app and
cookbook share their frame and preferences; their contextual navigation and page
content differ. The cookbook index is public. Its Dashboard, Activity, Chaos,
and Failures recipes use the existing session guard and fixture-backed services.
Editable dashboard, Canvas, and Live updates add interactive workspace recipes
under the same guard. The dashboard saves per-account layouts in this browser;
the canvas edits last for the current visit; live events use a labelled simulation.
Sign-in and sign-up return to the requested local page, preserving its query.

Routes live under `app/(workspace)/`: `app/` is the product canvas, and
`cookbook/` owns the examples. The shared navigation metadata is in `_lib/navigation.ts`.
Start product work in `app/(workspace)/app/page.tsx`; it imports no cookbook
implementation. Add recipes under `cookbook/(recipes)/` and register their
destinations in the navigation metadata. Old `/app/activity`, `/app/chaos`, and
`/app/failures` links redirect to their cookbook counterparts with queries intact.

## Component catalog

The kitchen sink has an overview and a page per category, with active sidebar
navigation, an on-page example index, and a collapsible menu on narrow screens.
Theme and density controls apply to the whole catalog.

| Area | Available building blocks |
| --- | --- |
| Foundations | Semantic tokens, type scale, Box, Flex, Container, Separator |
| Typography | Heading with independent level and size, Text, SectionLabel |
| Forms | Button, Input, Textarea, Field, Fieldset, Label, Checkbox, Radio, Select, Switch, Toggle, Slider |
| Pickers | Combobox, MultiSelect, DatePicker, DateRangePicker |
| Display | Panel, Badge, Avatar, Stat, Presence, Empty, Mock, DescriptionList |
| Cards | Card with composable header, title, description, body, media, footer, and actions; SelectionCard |
| Feedback | Alert, ErrorSurface, Skeleton, SkeletonText, Progress |
| Navigation | Breadcrumb, NavLink, Tabs, Pagination |
| Disclosure and overlays | Accordion, Dialog, AlertDialog, Popover, Tooltip, DropdownMenu |
| Tables | Table, THead, TBody, TFoot, Tr, Th, Td, SortableTh |
| Basic charts | ChartFrame, ChartLegend, BarChart, LineChart |
| Statistical charts | PlotFrame, Volcano, BubblePlot, RankedBar, Matrix, Legend, ColourBar, NothingKey |
| Network diagrams | GraphFrame and 11 layout/encoding presets |
| Patterns and shells | PageHeader, CollectionToolbar, AppShell, RailShell, AuthShell, NavigationRail, RailLink, ContextSidebar, SidebarNav |
| Interactive workspaces | Canvas, DashboardGrid, validated grid geometry and keyboard arrange actions |
| Utility and preferences | Icons, accessible text, portals, theme and density controls |

The [table examples](http://localhost:3000/kitchen-sink/tables) compose filtering,
sorting, selection across pages, pagination, and loading/empty/failure states.
Collection state lives at the call site; the table does not fetch or impose a
column schema.

The [card examples](http://localhost:3000/kitchen-sink/cards) compose records,
metrics, settings, selectable choices, and media from the same parts. Card parts
come from `components/display`; `SelectionCard` comes from `components/patterns`
and uses the existing radio/checkbox controls. A primary `CardLink` extends over
the card surface; secondary controls belong in `CardAction` or `CardFooter`.
Settings, selection, form submission/reset, and retry examples use local state.

The [picker examples](http://localhost:3000/kitchen-sink/pickers) cover searchable
choices, removable selections, typed date segments, calendars, constraints, and
native form submission/reset. Each compound picker owns its label, hint, and
error wiring. Public values are option IDs or Gregorian date strings; date
objects and the React Aria behavior engine stay inside the wrappers.

The [chart examples](http://localhost:3000/kitchen-sink/charts) use SVG/CSS with no
additional dependency. They preserve zero, negative line values, and missing
measurements, and expose exact values as text. Line plots scroll locally on
narrow screens to keep labels readable. `ChartFrame` can also contain a richer
chart engine.

The Overwatch family has its own [statistical chart examples](http://localhost:3000/kitchen-sink/statistical-charts)
and [network diagrams](http://localhost:3000/kitchen-sink/networks): force,
radial, circular, bipartite, multipartite, flow, clique, hairball, enrichment map,
module, and correlation networks. They render SVG with exact-value tables and
optional keyboard selection. Cytoscape is confined to the headless CoSE layout
adapter. These are bounded diagrams; they do not provide a graph editor.

The [shell examples](http://localhost:3000/kitchen-sink/shells) offer both the
standard header/sidebar layout and an icon rail with a collapsible contextual
sidebar. Each runs in an isolated, navigable preview with a full-page link.
Shells take slots; routes, account data, and persistence belong to the caller.

The [page patterns](http://localhost:3000/kitchen-sink/patterns) show collection
and detail-page compositions. These are reusable slots and recipes, with
application decisions supplied by the caller.

This covers the common application foundation. File-upload workflows,
notifications, virtualized grids, and advanced chart
interactions remain product-driven additions.

## Browser documents and live data

[`lib/storage`](lib/storage/doc.ts) provides a string-storage port with browser
and memory adapters. Register a document key, version, and decoder from `unknown`
with `createDocument`; reads distinguish missing data from corrupt, blocked, or
unsupported data. Writes and deletes return the existing `Result`/`Failure`
types. Migrations run in memory, and saving is explicit. There is no origin-wide
clear, silent persistence fallback, or atomic cross-tab transaction.
`useStoredDocument` in `lib/runtime/hooks.ts` binds this to stable snapshots after
hydration and observes changes in the same tab and other tabs.

The [editable dashboard](http://localhost:3000/cookbook/editable-dashboard) is the
first consumer: its draft stays separate from its saved configuration, failed
saves retain edits, and an observed external change asks the user to reload it.
Only widget IDs and grid geometry are stored. Widgets are resolved by the recipe's
registry; the reusable component has no storage or account dependency. Narrow
screens stack widgets without changing the saved desktop arrangement.

[`lib/realtime`](lib/realtime/doc.ts) supplies typed event subscriptions with
memory and native WebSocket adapters. The caller decodes its backend's envelope.
`useLiveQueries` (or `LiveQueryBridge`) in `lib/query` maps events to cache keys,
coalesces bursts, and resyncs declared keys when a connection opens. Keep the
source, mapping function, and resync keys stable for the subscription lifetime.
There is no blanket page remount, event-delivery guarantee, or vendor auth protocol.
The [live recipe](http://localhost:3000/cookbook/live-updates) demonstrates missed
events and stale-but-visible data with a controllable in-process source; it does
not connect to a deployed WebSocket backend.

The [workspace catalog](http://localhost:3000/kitchen-sink/workspaces) includes
editable, locked, and empty states. React Flow and React Grid Layout stay behind
owned wrappers in `components/workspaces`. Their public contracts use Flover
types; domain graphs, widget registries, save boundaries, and route behavior
belong to their callers. Undo/history and per-breakpoint authored layouts remain
possible follow-ups, shaped by actual product requirements.

## Structure

- `app/` — routes and framework bindings; the app/cookbook share `app/(workspace)/`,
  and the kitchen sink is under `app/(dev)/`.
- `components/` — grouped components with CSS Modules, public barrels, and contracts.
- `styles/` — tokens, resets, and cascade layers.
- `lib/` — kernel, transport port/adapters, services, composition root, cache, runtime, storage, and realtime.
- `protocols/` and `notes/` — optional working practices and architectural reasoning.

Read [CLAUDE.md](CLAUDE.md) and [protocols/README.md](protocols/README.md) for the
repository conventions.

To add a catalog category, add serializable metadata to
`app/(dev)/kitchen-sink/_lib/catalog.ts` and its component to
`_sections/registry.ts`. The registry must cover every category. Example anchors
and the on-page index derive from rendered `Case` components. Source viewers read
the actual component files.

## Verification

```sh
npm run check:architecture -- --changed
npm run test:architecture
npm test
npm run lint
npm run build
```

The [architecture checker](tools/architecture/README.md) enforces declared layer,
adapter, wrapper, and server-return boundaries. Use `--all` for a baseline or
`--base main` for a branch review. It reports scope, exceptions, and evidence;
exit 0 covers mechanical checks only. Reuse, error scope, composition, and design
system judgments stay pending for the [agent review guide](tools/architecture/REVIEW.md).
Ask: “Review these changes using tools/architecture/REVIEW.md.” Neither the
command nor that review applies fixes automatically.

UI tests exercise accessible output, keyboard behavior, collection transitions,
and chart data/geometry. These are ordinary implementation-aware tests. The
separate blind, specification-based procedure is described in
[protocols/spec-tests.md](protocols/spec-tests.md).

Changes to layout, hydration, or navigation also need browser verification;
jsdom cannot establish those properties.
