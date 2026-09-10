/**
 * Charts — a small presentation vocabulary for ordinary app metrics.
 *
 * § CONTRACT
 * ChartFrame supplies a figure with a required title, optional description,
 * actions, plot, legend, and source/footer content. It assumes no chart engine.
 * ChartLegend pairs series names with a color and a line style.
 * BarChart accepts labelled, finite, nonnegative amounts. Zero is a real bar
 * value; missing or invalid values are marked unavailable. An empty array is
 * an explicit empty state. Labels and exact values remain available as text.
 * LineChart accepts ordered labels and numeric values or null. Null breaks a
 * line instead of being joined or treated as zero. Domains include zero and
 * negative values. Constant and single-point series remain representable.
 * A required accessible name and an adjacent data table expose the values.
 * A dataset with rows but no finite values is reported as unavailable, with
 * its labelled rows still accessible in the table. Small viewports scroll the
 * plot locally so axis labels retain a readable size.
 * Text values preserve numeric precision by default. Axis ticks may use a
 * shorter notation; a caller-supplied formatter explicitly owns its rounding.
 *
 * § MECHANICS
 * Simple SVG/CSS plots and semantic HTML use tokens. Richer chart engines can
 * occupy ChartFrame without changing its contract.
 *
 * § OVERWATCH FAMILY — PORT CONTRACT
 * PlotFrame composes linear axes, grid, reference rules, marks, and overlays.
 * Volcano plots caller-transformed effect/significance values; BubblePlot maps
 * weight to area; RankedBar sorts descending and measures bars from zero.
 * Each supplies a name and an exact-value table; empty/invalid inputs remain
 * explicit. Matrix preserves value, measured absence, unattempted, and n/a.
 * Coverage excludes n/a from both halves of the ratio and is null when no
 * question applies. Optional cell selection is keyboard-operable.
 * GraphFrame renders nodes, edges, and caller-labelled group annotations.
 * Force, radial, circular, bipartite, multipartite, flow, clique, hairball,
 * enrichment, module, and correlation networks are presets over that frame.
 * Positions are deterministic for the same input; hover/selection must not
 * rerun layout. Selection works with pointer, Enter, and Space, and exact graph
 * records remain available outside the picture. Dangling edges are ignored.
 *
 * § PORT MECHANICS
 * Adapted from overwatch-ui, with its pure scale/layout/encoding functions and
 * SVG renderers. Cytoscape is confined to the headless CoSE layout adapter;
 * it does not render the graph or introduce an editor runtime. The selected
 * palette also comes from Overwatch; its original color-vision measurements
 * are provenance, not a claim of a fresh audit on every Flover surface.
 * These are bounded chart pictures, not drag/pan/zoom editors or a time scale.
 */
export {};
