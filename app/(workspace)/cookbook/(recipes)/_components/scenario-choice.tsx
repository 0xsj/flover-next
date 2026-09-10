"use client";
import { Field, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/forms";
import s from "./recipe.module.css";

/** Recipe control composition; choices stay with the scenario that owns them. */
export function ScenarioChoice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly { value: NoInfer<T>; label: string }[]; onChange(value: NoInfer<T>): void }) {
  return <div className={s.choice}><Field label={label}>{control => <Select value={value} onValueChange={raw => { const choice = options.find(option => option.value === raw); if (choice) onChange(choice.value); }}><SelectTrigger {...control}><SelectValue /></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>}</Field></div>;
}
