import type { HTMLAttributes } from "react";
import { cn } from "@/lib/kernel";
import { splitSpace, type SpaceProps } from "../../style-props";
import s from "./container.module.css";

export type ContainerProps = HTMLAttributes<HTMLElement> &
  SpaceProps & {
    /** `page` is the full working width; `measure` is a reading column, capped
     *  in CHARACTERS rather than pixels because that is what legibility depends
     *  on. Both are tokens. */
    width?: "page" | "measure";
  };

/** Centres content and caps its width. The only layout decision this group
 *  makes on a screen's behalf, because a reading measure is a typographic fact
 *  rather than an arrangement. */
export function Container({ width = "page", className, style, ...props }: ContainerProps) {
  const [spacing, rest] = splitSpace(props);
  return (
    <div
      className={cn(s.container, width === "measure" ? s.measure : s.page, className)}
      style={{ ...spacing, ...style }}
      {...rest}
    />
  );
}
