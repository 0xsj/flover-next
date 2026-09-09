import { useId, type ReactNode } from "react";
import { cn } from "@/lib/kernel";
import { Label } from "../label";
import s from "./field.module.css";

/** Exactly the attributes the control must carry. Named as the attributes they
 *  become, so a caller spreads them and is done. */
export type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  required?: true;
};

export type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
};

export function Field({ label, hint, error, required, className, children }: FieldProps) {
  // Stable across a server render and its hydration, and unique per instance.
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  // Error FIRST: a reader announces them in this order and the error is the
  // more urgent. Absent rather than empty when there is neither.
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn(s.field, className)}>
      <Label htmlFor={id}>
        {label}
        {/* The mark is visual only. `required` on the control is the
            announcement, and hearing "star" after every label is noise. */}
        {required ? <span className={s.required} aria-hidden="true">*</span> : null}
      </Label>

      {children({
        id,
        "aria-describedby": describedBy,
        // Absent, never false: `aria-invalid="false"` is a different
        // announcement from no attribute at all.
        "aria-invalid": error ? true : undefined,
        required: required || undefined,
      })}

      {error ? <p id={errorId} className={s.error}>{error}</p> : null}
      {hint ? <p id={hintId} className={s.hint}>{hint}</p> : null}
    </div>
  );
}
