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
The Resilience recipe exercises malformed responses, out-of-order reads, and
uncertain saves against isolated memory fixtures, including production previews.
Diagnostics records the path through those reads. URL state demonstrates a
shareable collection with search, filters, sorting, pagination, and view mode.
Sign-in and sign-up return to the requested local page, preserving its query.

Routes live under `app/(workspace)/`: `app/` is the product canvas, and
`cookbook/` owns the examples. The shared navigation metadata is in `_lib/navigation.ts`.
Start product work in `app/(workspace)/app/page.tsx`; it imports no cookbook
implementation. Add recipes under `cookbook/(recipes)/` and register their
destinations in the navigation metadata. Old `/app/activity`, `/app/chaos`, and
`/app/failures` links redirect to their cookbook counterparts with queries intact.

## Response boundaries and recovery

Services request `unknown` and decode every consumed successful response before
exposing domain values. Readers beside each service validate nested data and
select only public fields. `lib/http/response.ts` supplies small reader helpers;
a product can map its own success envelope in its reader without changing the
transport or UI. A malformed response is `internal` / `invalid_response`, while
an empty collection remains a valid result.

The [resilience recipe](http://localhost:3000/cookbook/resilience) covers retaining
previous data after a bad refresh, ignoring an obsolete response, and preserving
drafts while a save outcome is reconciled. `lib/chaos/sequence.ts` supplies finite
request scripts and manually released response gates. These run only through an
explicit isolated cookbook root; normal application chaos stays off in production.
`lib/runtime/latest-read.ts` owns replaceable uncached reads; cached resources
continue to use `lib/query`.

The note example requires backend operation deduplication and authoritative
status, including terminal absence. It does not promise safe retry against an
arbitrary server. Drafts in this recipe last for the current visit only.

```sh
npm run test:resilience
npm run test:resilience:mutations
```

The [mutation harness](tools/resilience/README.md) works in a temporary source
copy and reports assertion failures separately from invalid mutants. These are
ordinary implementation-visible tests with curated mutations, not a blind
spec-test provenance claim.

## Diagnostics and URL state

`lib/diagnostics` exposes an optional recording port and a bounded memory adapter.
Create a trace per action, pass it through service `CallOptions`, and wrap the
action with `trace.run("operation", work)`. Roots decorate their transports;
response decoders record separately. A successful request can therefore precede
a contract rejection. Concurrent actions keep explicit trace identities, and a
throwing or rejecting recorder cannot change the operation's result.

The [diagnostics recipe](http://localhost:3000/cookbook/diagnostics) demonstrates
success, transport failure, malformed success, empty results, cancellation, and
recovery. Its visit-local buffer keeps only timing, opaque IDs, static operation
labels, and failure classifications. Request bodies, addresses, credentials,
and failure messages are excluded. Callers must supply non-sensitive labels and
IDs; there is no automatic global recorder or remote exporter.

`lib/url-state` owns typed query codecs, defaults, validation, and serialization
without a framework dependency. `lib/runtime/url-state.ts` binds them to Next's
search parameters and browser history. Writers merge against the latest address,
omit defaults, preserve unowned parameters and fragments, and return a `Result`
if validation or browser history fails. Malformed or repeated scalar parameters
produce explicit warnings and typed defaults; reading never rewrites the URL.

The [URL state recipe](http://localhost:3000/cookbook/url-state) uses those codecs
for a public fixture collection. Filter changes reset pagination, view changes
preserve it, and back/forward restores the view. Valid but out-of-range pages
offer explicit recovery. Committed changes push history; explicit URL repairs
replace it. This binding is for client-owned view state. A route that fetches
server data from its query can reuse the codecs with router navigation instead.
URLs are shareable: keep secrets and private drafts out of query state.

Both modules have ordinary implementation-visible contract tests. They do not
claim an implementation-blind test writer or a mutation score.

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
