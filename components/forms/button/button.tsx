import { Slot } from "radix-ui";
import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "@/components/utility";
import { cn } from "@/lib/kernel";
import s from "./button.module.css";
import { buttonVariants, type ButtonVariants } from "./button.variants";

type BaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> &
  ButtonVariants & {
    asChild?: boolean;
    loading?: boolean;
  };

/** A union, not one object: the `icon` size renders no text, so a screen reader
 *  has nothing to announce unless a label is supplied. Making it required on
 *  that branch alone turns the most common accessible-name failure in a
 *  component library into a type error. */
export type ButtonProps =
  | (BaseProps & { size?: Exclude<ButtonVariants["size"], "icon"> })
  | (BaseProps & { size: "icon"; "aria-label": string });

export function Button({
  asChild = false,
  className,
  intent,
  size,
  loading = false,
  disabled = false,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  const inert = disabled || loading;

  return (
    <Comp
      /* Two branches because `disabled` means nothing on an arbitrary element
         and cannot be removed from one. Every attribute here is an attribute —
         nothing wraps or synthesises a handler, because a component that always
         attaches one cannot be rendered from a server component and takes every
         page that renders it down with it. */
      {...(asChild
        ? { "aria-disabled": inert || undefined, tabIndex: inert ? -1 : undefined }
        : { disabled: inert, type })}
      /* `|| undefined`, so the attribute is ABSENT rather than "false" —
         `[data-disabled]` matches the string "false" perfectly well. */
      data-disabled={inert || undefined}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ intent, size }), className)}
      {...props}
    >
      {loading ? <LoaderCircle className={s.spinner} aria-hidden="true" /> : null}
      {/* Marks which child receives the merged props when there are several, so
          the indicator renders INSIDE the caller's element rather than beside
          it — correct markup, and the only arrangement where layout survives. */}
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
    </Comp>
  );
}
