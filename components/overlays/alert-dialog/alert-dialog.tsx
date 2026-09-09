"use client";

import { AlertDialog as Primitive } from "radix-ui";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/kernel";
import surface from "../../surface.module.css";
import o from "../overlay.module.css";

export type AlertDialogProps = ComponentPropsWithoutRef<typeof Primitive.Root>;

export const AlertDialog = (props: AlertDialogProps) => <Primitive.Root {...props} />;
export const AlertDialogTrigger = (props: ComponentPropsWithoutRef<typeof Primitive.Trigger>) =>
  <Primitive.Trigger {...props} />;
/** The destructive one. Deliberately separate from Cancel so a caller cannot
 *  give them the same weight by accident. */
export const AlertDialogAction = (props: ComponentPropsWithoutRef<typeof Primitive.Action>) =>
  <Primitive.Action {...props} />;
export const AlertDialogCancel = (props: ComponentPropsWithoutRef<typeof Primitive.Cancel>) =>
  <Primitive.Cancel {...props} />;

export type AlertDialogContentProps = Omit<
  ComponentPropsWithoutRef<typeof Primitive.Content>, "title"
> & { title: string; description: string; children: ReactNode };

/** A dialog that requires a choice.
 *
 *  Unlike a Dialog it does NOT close on an outside click, and there is no close
 *  button: the only ways out are the two buttons and Escape. That is the whole
 *  difference, and it is why `description` is required here and optional there —
 *  a question you cannot dismiss by looking away has to say what it is asking. */
export function AlertDialogContent({
  title, description, className, children, ...props
}: AlertDialogContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className={o.scrim} />
      <Primitive.Content className={cn(surface.elevated, o.panel, className)} {...props}>
        <div className={o.head}>
          <Primitive.Title className={o.title}>{title}</Primitive.Title>
          <Primitive.Description className={o.description}>{description}</Primitive.Description>
        </div>
        <div className={o.footer}>{children}</div>
      </Primitive.Content>
    </Primitive.Portal>
  );
}
