import { Slot } from "radix-ui";
import type { HTMLAttributes } from "react";
import { splitSpace, type SpaceProps } from "../../style-props";

export type BoxProps = HTMLAttributes<HTMLElement> &
  SpaceProps & {
    /** Render the caller's element instead of a div, carrying the spacing.
     *  Same mechanism as the button's, so a Box never adds a wrapper. */
    asChild?: boolean;
  };

/** A div with spacing props, and nothing else.
 *
 *  It has no appearance of its own — no background, border, radius or colour.
 *  A Box that could be styled from the outside would let a screen restyle a
 *  primitive, which is what the cascade tiers exist to prevent. */
export function Box({ asChild, style, ...props }: BoxProps) {
  const [spacing, rest] = splitSpace(props);
  const Comp = asChild ? Slot.Root : "div";
  return <Comp style={{ ...spacing, ...style }} {...rest} />;
}
