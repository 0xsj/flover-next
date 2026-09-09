import { AccessibleIcon as Primitive } from "radix-ui";
import type { ReactElement } from "react";

export type AccessibleIconProps = {
  /** REQUIRED. An icon reaching this component is one that carries meaning,
   *  and meaning with no name is a shape the reader is not told about. */
  label: string;
  /** Exactly one element. Typed as `ReactElement` rather than `ReactNode`
   *  because the primitive calls `Children.only` — two children is a runtime
   *  throw there and a type error here. */
  children: ReactElement;
};

/** An icon that IS the meaning, named for a reader and hidden from them twice
 *  over — `aria-hidden` so it is not announced as a graphic, and
 *  `focusable="false"` because an SVG can otherwise take tab focus.
 *
 *  # This is the rarest of the three cases, not the default
 *
 *      decorative                 aria-hidden="true" on the icon. No component.
 *      inside a named control     name the CONTROL. An icon-only button takes
 *                                 aria-label; putting the name on the icon too
 *                                 announces it twice.
 *      the icon is the whole      this. A status glyph in a table cell, with
 *      meaning, and nothing       no labellable ancestor to hang the name on.
 *      around it can be named
 *
 *  Reaching for it inside a button is the common mistake, and it reads as extra
 *  diligence, which is why it survives review.
 *
 *  Renders a fragment: the icon, then the name. No wrapper element, so it does
 *  not disturb a flex row it is dropped into.
 *
 *  # The child must forward its props
 *
 *  The two attributes are added by CLONING the child, so a child that does not
 *  spread props onto the element it renders swallows them — measured: the name
 *  is announced AND the graphic is announced, which is the defect this exists
 *  to prevent, arrived at through the component meant to fix it. Icons from
 *  `icon.ts` spread; a local `() => <svg/>` wrapper does not. */
export function AccessibleIcon({ label, children }: AccessibleIconProps) {
  return <Primitive.Root label={label}>{children}</Primitive.Root>;
}
