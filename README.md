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

Open [the kitchen sink](http://localhost:3000/kitchen-sink) to explore the design
system. The landing page and fixture-backed application are at `/` and `/app`.

## Component catalog

The kitchen sink has an overview and a page per category, with active sidebar
navigation, an on-page example index, and a collapsible menu on narrow screens.
Theme and density controls apply to the whole catalog.

| Area | Available building blocks |
| --- | --- |
| Foundations | Semantic tokens, type scale, Box, Flex, Container, Separator |
| Typography | Heading with independent level and size, Text, SectionLabel |
| Forms | Button, Input, Textarea, Field, Fieldset, Label, Checkbox, Radio, Select, Switch, Toggle, Slider |
| Display | Panel, Badge, Avatar, Stat, Presence, Empty, Mock, DescriptionList |
| Feedback | Alert, ErrorSurface, Skeleton, SkeletonText, Progress |
| Navigation | Breadcrumb, NavLink, Tabs, Pagination |
| Disclosure and overlays | Accordion, Dialog, AlertDialog, Popover, Tooltip, DropdownMenu |
| Tables | Table, THead, TBody, TFoot, Tr, Th, Td, SortableTh |
| Basic charts | ChartFrame, ChartLegend, BarChart, LineChart |
| Statistical charts | PlotFrame, Volcano, BubblePlot, RankedBar, Matrix, Legend, ColourBar, NothingKey |
| Network diagrams | GraphFrame and 11 layout/encoding presets |
| Patterns and shells | PageHeader, CollectionToolbar, AppShell, RailShell, AuthShell, NavigationRail, RailLink, ContextSidebar, SidebarNav |
| Utility and preferences | Icons, accessible text, portals, theme and density controls |

The [table examples](http://localhost:3000/kitchen-sink/tables) compose filtering,
sorting, selection across pages, pagination, and loading/empty/failure states.
Collection state lives at the call site; the table does not fetch or impose a
column schema.

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

This covers the common application foundation. Searchable comboboxes, calendars,
file-upload workflows, notifications, virtualized grids, and advanced chart
interactions remain product-driven additions.

## Structure

- `app/` — routes and framework bindings; the kitchen sink is under `app/(dev)/`.
- `components/` — grouped components with CSS Modules, public barrels, and contracts.
- `styles/` — tokens, resets, and cascade layers.
- `lib/` — kernel, transport port/adapters, services, composition root, cache, and runtime.
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
npm test
npm run lint
npm run build
```

UI tests exercise accessible output, keyboard behavior, collection transitions,
and chart data/geometry. These are ordinary implementation-aware tests. The
separate blind, specification-based procedure is described in
[protocols/spec-tests.md](protocols/spec-tests.md).

Changes to layout, hydration, or navigation also need browser verification;
jsdom cannot establish those properties.
