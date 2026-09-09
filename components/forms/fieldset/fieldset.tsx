import { useId, type FieldsetHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/kernel";
import s from "./fieldset.module.css";

export type FieldsetProps = Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "title"> & {
  /** Names the SET. Rendered as a `<legend>`, the one element announced before
   *  every control inside the group. */
  legend: ReactNode;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
};

/** A group of controls that share one question.
 *
 *  The counterpart to `Field`, and the difference is where the wiring goes: a
 *  single control receives it, a GROUP keeps it on the container. Children are
 *  therefore plain nodes here — there is nothing to hand down. */
export function Fieldset({
  legend, hint, error, className, children, ...props
}: FieldsetProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset
      className={cn(s.fieldset, className)}
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
      {...props}
    >
      <legend className={s.legend}>{legend}</legend>
      {hint ? <p id={hintId} className={s.hint}>{hint}</p> : null}
      <div className={s.body}>{children}</div>
      {error ? <p id={errorId} className={s.error}>{error}</p> : null}
    </fieldset>
  );
}
