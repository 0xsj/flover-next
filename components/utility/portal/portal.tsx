"use client";

import { Portal as Primitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

export type PortalProps = ComponentPropsWithoutRef<typeof Primitive.Root>;

/** Render into `document.body` while staying in the React tree.
 *
 *  # Rarely the answer
 *
 *  Every overlay in this system portals itself already. Reach for this only
 *  when an element must escape an ancestor that clips or contains it —
 *  `overflow: hidden`, or a `transform`, which makes that ancestor the
 *  containing block for everything fixed inside it.
 *
 *  # Two trees, and only one of them moves
 *
 *  The DOM parent becomes `document.body`; the REACT parent does not change.
 *  So context still reaches, and a React event still bubbles to the handler on
 *  the component that rendered this — which is the part that surprises people,
 *  in both directions. A native listener on the old DOM parent stops firing; a
 *  React `onClick` on it keeps firing.
 *
 *  # It renders nothing on the server
 *
 *  Measured: the primitive gates on a mount effect, so server HTML and the
 *  first client render are both empty. Nothing that must be in the first paint,
 *  or indexable, may live inside one. */
export function Portal(props: PortalProps) {
  return <Primitive.Root {...props} />;
}
