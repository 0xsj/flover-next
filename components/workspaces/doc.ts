/**
 * Workspaces — controlled interactive surfaces, independent of persistence.
 *
 * CONTRACT (written before implementation)
 * Canvas takes nodes with stable IDs, positions, and caller-rendered content,
 * edges, a selection, and callbacks. It supplies pan/zoom, fit, node dragging,
 * keyboard movement/selection, and an explicit empty state. It reports controlled
 * position changes; save boundaries, data layout, and authored pins belong to callers.
 * No product graph, connection creation, or node inspector schema is built in.
 *
 * DashboardGrid takes stable widget IDs, titles, content, and layout in grid
 * units. View mode has no editing handles. Edit mode permits pointer drag/resize
 * and equivalent labelled move/size menu actions, with bounded geometry. Occupied
 * destinations are refused. Removal and
 * adding widgets belong to the caller. Narrow screens stack the same widgets;
 * they do not overwrite the saved desktop arrangement. Empty content is explicit.
 * Layout commits describe an arrangement, never React nodes or fetched data.
 *
 * MECHANICS
 * React Flow and React Grid Layout remain implementation details of these owned
 * wrappers. Public props use Flover types; vendor imports/CSS live here only.
 * Canvas retains measured node dimensions in its renderer state; dropping them
 * on a controlled update resets handle bounds and makes edges disappear. These
 * measurements never enter the caller's saved graph. Theme overrides use the
 * engine's public variables, since its local defaults shadow inherited defaults.
 * Edge SVGs opt out of the image reset's max-inline-size: their coordinate
 * container is intentionally zero-width. A path can exist in the DOM with valid
 * geometry and still paint nothing when its SVG viewport is capped to zero.
 * Kitchen sink exercises controlled, read-only, and empty states; cookbook adds
 * the domain registry and persistence. Neither engine is reimplemented as bespoke
 * pointer physics. Keyboard alternatives are part of our contract, even where
 * the engine only supplies pointer behavior.
 *
 * VERIFICATION
 * Ordinary tests and browser interaction checks, with implementation access.
 * No blind spec-test run or assistive-technology certification is claimed.
 */
export {};
