"use client";

import { useId, type ReactNode } from "react";
import { Card, CardBody, CardHeader } from "@/components/display";
import { Checkbox, Radio } from "@/components/forms";
import { cn } from "@/lib/kernel";
import s from "./selection-card.module.css";

type BaseProps = {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
};
export type SelectionCardProps = BaseProps & (
  | { mode: "single" }
  | { mode: "multiple"; name?: string; checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (checked: boolean) => void }
);

export function SelectionCard(props: SelectionCardProps) {
  const { label, value, description, disabled, children, className } = props;
  const id = useId(), labelId = `${id}-label`, descriptionId = description ? `${id}-description` : undefined;
  const control = { id, value, disabled, "aria-labelledby": labelId, "aria-describedby": descriptionId };
  return <Card as="div" className={cn(s.card, className)} data-disabled={disabled || undefined}>
    <CardHeader actions={props.mode === "single" ? <Radio {...control} /> : <Checkbox {...control} name={props.name}
      checked={props.checked} defaultChecked={props.defaultChecked}
      onCheckedChange={props.onCheckedChange ? (checked) => props.onCheckedChange?.(checked === true) : undefined} />}>
      <label id={labelId} htmlFor={id} className={s.label}>{label}</label>
      {description && <p id={descriptionId} className={s.description}>{description}</p>}
    </CardHeader>
    {children != null && <CardBody>{children}</CardBody>}
  </Card>;
}
