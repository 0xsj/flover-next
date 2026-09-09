import { Slot } from "radix-ui";
import type { CSSProperties, HTMLAttributes } from "react";
import { splitSpace, type SpaceProps } from "../../style-props";

export type FlexProps = HTMLAttributes<HTMLElement> &
  SpaceProps & {
    asChild?: boolean;
    /** `row` by default, matching the platform. */
    direction?: CSSProperties["flexDirection"];
    align?: CSSProperties["alignItems"];
    justify?: CSSProperties["justifyContent"];
    wrap?: boolean;
    inline?: boolean;
    /** Shorthand for `flex: 1 1 0` on this element, which is the arrangement
     *  people reach for and misspell. */
    grow?: boolean;
  };

export function Flex({
  asChild, direction, align, justify, wrap, inline, grow, style, ...props
}: FlexProps) {
  const [spacing, rest] = splitSpace(props);
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      style={{
        display: inline ? "inline-flex" : "flex",
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : undefined,
        /* Longhands rather than the `flex` shorthand: its unitless basis is
           parsed inconsistently outside a browser, and three explicit
           declarations cannot be misread. */
        flexGrow: grow ? 1 : undefined,
        flexShrink: grow ? 1 : undefined,
        flexBasis: grow ? 0 : undefined,
        // `min-inline-size: 0` on a flex child that grows, because the default
        // `auto` refuses to shrink below its content and overflows the row —
        // the single commonest flex defect, and it is not the caller's fault.
        minInlineSize: grow ? 0 : undefined,
        ...spacing,
        ...style,
      }}
      {...rest}
    />
  );
}
