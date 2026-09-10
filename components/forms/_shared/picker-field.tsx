"use client";

import { FieldError, Label, Text } from "react-aria-components";
import s from "./picker.module.css";

export type PickerFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  className?: string;
};

export function PickerLabel({ label, required }: Pick<PickerFieldProps, "label" | "required">) {
  // The overlay hides surrounding content from assistive technology. A hidden
  // referenced label includes hidden descendants in its name, so keep the
  // decorative required marker outside that label.
  return <div className={s.label}><Label>{label}</Label>{required && <span className={s.required} aria-hidden="true">*</span>}</div>;
}

export function PickerMessages({ hint, error }: Pick<PickerFieldProps, "hint" | "error">) {
  return <>
    <FieldError className={s.error}>{error}</FieldError>
    {hint && <Text slot="description" className={s.hint}>{hint}</Text>}
  </>;
}
