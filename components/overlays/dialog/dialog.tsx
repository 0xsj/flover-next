"use client";

import { Dialog as Primitive } from "radix-ui";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { VisuallyHidden, X } from "@/components/utility";
import { cn } from "@/lib/kernel";
import surface from "../../surface.module.css";
import o from "../overlay.module.css";

export type DialogProps = ComponentPropsWithoutRef<typeof Primitive.Root>;
export type DialogTriggerProps = ComponentPropsWithoutRef<typeof Primitive.Trigger>;

export const Dialog = (props: DialogProps) => <Primitive.Root {...props} />;
export const DialogTrigger = (props: DialogTriggerProps) => <Primitive.Trigger {...props} />;
export const DialogClose = (props: ComponentPropsWithoutRef<typeof Primitive.Close>) =>
  <Primitive.Close {...props} />;

export type DialogContentProps = Omit<
  ComponentPropsWithoutRef<typeof Primitive.Content>, "title"
> & {
  /** REQUIRED, and a prop rather than a child.
   *
   *  A dialog with no accessible name is announced as "dialog" and nothing
   *  else, which is the commonest defect in this component and one a visual
   *  review cannot see. Making it a required prop turns it from a thing you
   *  remember into a thing that does not typecheck. */
  title: string;
  description?: string;
  /** Hide the title visually where the surrounding design already names the
   *  dialog. It is still announced — this is never a way to omit it. */
  hideTitle?: boolean;
  closeLabel?: string;
  children: ReactNode;
};

export function DialogContent({
  title, description, hideTitle, closeLabel = "Close", className, children, ...props
}: DialogContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className={o.scrim} />
      <Primitive.Content className={cn(surface.elevated, o.panel, className)} {...props}>
        <div className={o.head}>
          {/* `asChild` hides the Title itself rather than nesting it in a
              hidden span, so the primitive still sees its own Title element. */}
          {hideTitle ? (
            <VisuallyHidden asChild><Primitive.Title>{title}</Primitive.Title></VisuallyHidden>
          ) : (
            <Primitive.Title className={o.title}>{title}</Primitive.Title>
          )}
          {description ? (
            <Primitive.Description className={o.description}>{description}</Primitive.Description>
          ) : null}
        </div>
        <div className={o.body}>{children}</div>
        <Primitive.Close className={o.close} aria-label={closeLabel}>
          <X size={14} aria-hidden="true" />
        </Primitive.Close>
      </Primitive.Content>
    </Primitive.Portal>
  );
}

export const DialogFooter = ({ children }: { children: ReactNode }) => (
  <div className={o.footer}>{children}</div>
);
