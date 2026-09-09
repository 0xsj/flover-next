import { VisuallyHidden as Primitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

export type VisuallyHiddenProps = ComponentPropsWithoutRef<typeof Primitive.Root>;

/** Text for a reader and not for the screen.
 *
 *  Not `display: none` and not `hidden` — both remove it from the
 *  accessibility tree, which is the one thing this must not do. It is clipped
 *  to a one-pixel box and left in the tree, so it is announced and not seen.
 *
 *  # The styles are inline, deliberately
 *
 *  The primitive sets them as a frozen style object rather than a class, so
 *  nothing in the cascade can win against it. That is the right trade for the
 *  one mechanism whose failure is visible to everybody: a composition-layer
 *  rule reaching a descendant, or a caller passing a className, would otherwise
 *  put stray text on the screen.
 *
 *  The cost is that CSS cannot un-hide it, so **a skip link is not this
 *  component** — that needs to become visible on focus, and an inline style
 *  cannot be un-set by a stylesheet. Build one when the chrome group needs one.
 *
 *  Use `asChild` to hide an element the caller already owns, rather than
 *  nesting one inside a hidden span. */
export function VisuallyHidden(props: VisuallyHiddenProps) {
  return <Primitive.Root {...props} />;
}
