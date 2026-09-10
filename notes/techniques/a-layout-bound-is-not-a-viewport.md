A layout's requested bounds do not guarantee that its finished picture fits the viewport, especially when labels and annotations are added after layout.

Observed while porting Overwatch's charts into Flover, 2026-09-10. Headless CoSE
could place disconnected components outside its requested bounding box. The SVG
still rendered correctly as markup, and its graph records were complete, while
parts of the picture were clipped.

There are two bounds to account for. Fit the completed node positions uniformly
before applying caller pins; fitting each axis separately distorts distances.
Then include the renderer's labels and group annotations in the scene bounds.
Those marks did not exist when the layout engine chose its positions.

Keep the SVG's physical dimensions consistent with those scene bounds. Shrinking
the whole picture to fit a narrow container also shrinks its labels. Local
scrolling preserves their size, and an adjacent table makes the records available
without navigating the picture.

The geometry tests check the first obligation. Browser inspection caught the
second; neither a passing layout test nor a valid SVG establishes both.
