import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/kernel";
import { inputVariants, type InputVariants } from "./input.variants";

type Shared = Omit<InputVariants, "multiline">;

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & Shared;

/** A text control, and nothing else. It owns no label, no error and no
 *  description — `Field` owns those and hands this the attributes that connect
 *  them. See `../field/doc.ts`. */
export function Input({ className, size, mono, ...props }: InputProps) {
  return <input className={cn(inputVariants({ size, mono }), className)} {...props} />;
}

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> & Shared;

/** The same control with a height. Same file because it is the same styling and
 *  the same contract — splitting them would duplicate both and let them drift,
 *  and a caller choosing between them is choosing a shape, not a component. */
export function Textarea({ className, size, mono, rows = 4, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(inputVariants({ size, mono, multiline: true }), className)}
      {...props}
    />
  );
}
