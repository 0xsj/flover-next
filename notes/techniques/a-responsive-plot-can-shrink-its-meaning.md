# A responsive SVG can preserve every data point while shrinking the labels that explain them below a readable size.

Fitting a fixed view box into a narrow container scales text and geometry
together. Nothing overflows, the screenshot contains the whole chart, and the
axis labels can still be six pixels tall. An overflow check alone calls that a
success.

Treat the plot and its explanation as separate constraints. Keep a minimum
readable plot width and allow local scrolling, or recalculate the chart layout
for the available space. Supply exact values in ordinary text so reading the
data does not depend on following a line or distinguishing two colors.

The second check matters as much as the first: a chart with no finite values
should say that its measurements are unavailable. An empty plot over a default
zero-to-one axis supplies numeric context that the data never supplied.
