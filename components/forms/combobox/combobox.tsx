"use client";

import {
  Button, ComboBox as Primitive, ComboBoxValue, Group, Input, ListBox,
  ListBoxItem, Popover, Tag, TagGroup, TagList, Text,
} from "react-aria-components";
import { Check, ChevronDown, X } from "@/components/utility";
import { cn } from "@/lib/kernel";
import { PickerLabel, PickerMessages, type PickerFieldProps } from "../_shared/picker-field";
import field from "../_shared/picker.module.css";
import surface from "../../surface.module.css";
import s from "./combobox.module.css";

export type ChoiceOption = { value: string; label: string; description?: string; disabled?: boolean };
export type ChoiceControlProps = PickerFieldProps & {
  options: readonly ChoiceOption[];
  placeholder?: string;
  name?: string;
  form?: string;
  emptyMessage?: string;
};
export type ComboboxProps = ChoiceControlProps & {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
};
export type MultiChoiceProps = ChoiceControlProps & {
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
};

export function Combobox(props: ComboboxProps) {
  return <ChoicePicker {...props} mode="single" />;
}

/** Shared engine for two public controls; queries never become submitted values. */
export function ChoicePicker(props: (ComboboxProps & { mode: "single" }) | (MultiChoiceProps & { mode: "multiple" })) {
  const { options, label, hint, error, disabled, readOnly, required, id, name, form, placeholder = "Search options…", className, emptyMessage, mode } = props;
  const multiple = mode === "multiple";
  const value = props.mode === "multiple" ? props.value && [...props.value] : props.value;
  const defaultValue = props.mode === "multiple" ? props.defaultValue && [...props.defaultValue] : props.defaultValue;
  return <Primitive<ChoiceOption, "single" | "multiple">
    id={id} name={name} form={form} selectionMode={mode}
    defaultItems={options} disabledKeys={options.filter((option) => option.disabled).map((option) => option.value)}
    value={value} defaultValue={defaultValue}
    onChange={(next) => {
      if (props.mode === "multiple") props.onValueChange?.(Array.isArray(next) ? next.map(String) : []);
      else props.onValueChange?.(next === null ? null : String(next));
    }}
    isDisabled={disabled} isReadOnly={readOnly} isRequired={required} isInvalid={Boolean(error) || undefined}
    allowsEmptyCollection className={cn(field.field, className)}
  >
    <PickerLabel label={label} required={required} />
    <Group className={field.control}>
      <Input className={s.input} placeholder={placeholder} />
      {!multiple && <ComboBoxValue<ChoiceOption> className={s.clear}>
        {({ state }) => state.value !== null && !disabled && !readOnly ? <Button slot={null} className={field.iconButton} aria-label={`Clear ${label}`} onPress={() => { state.setValue(null); state.setInputValue(""); }}><X size={13} aria-hidden="true" /></Button> : null}
      </ComboBoxValue>}
      <Button className={field.iconButton} aria-label="Show options for"><ChevronDown size={14} aria-hidden="true" /></Button>
    </Group>
    {multiple && <ComboBoxValue<ChoiceOption> className={s.selection}>
      {({ selectedItems, state }) => {
        const selected = selectedItems.filter((item): item is ChoiceOption => item !== null);
        if (!selected.length) return null;
        if (disabled || readOnly) return <ul className={s.tags} aria-label={`Selected ${label}`}>{selected.map((item) => <li key={item.value} className={s.tag}>{item.label}</li>)}</ul>;
        return <TagGroup aria-label={`Selected ${label}`} onRemove={(keys) => {
          if (Array.isArray(state.value)) state.setValue(state.value.filter((key) => !keys.has(key)));
        }}><TagList items={selected} className={s.tags}>{(item) => <Tag id={item.value} textValue={item.label} className={s.tag}>
          <span>{item.label}</span>
          <Button slot="remove" aria-label="Remove" className={s.remove}><X size={12} aria-hidden="true" /></Button>
        </Tag>}</TagList></TagGroup>;
      }}
    </ComboBoxValue>}
    <PickerMessages hint={hint} error={error} />
    <Popover placement="bottom start" offset={6} className={cn(surface.elevated, field.popover, s.popover)}>
      <ListBox<ChoiceOption> className={s.list} renderEmptyState={() => <p className={s.empty}>{emptyMessage ?? (options.length ? "No matching options." : "No options available.")}</p>}>
        {(option) => <ListBoxItem id={option.value} textValue={option.label} className={s.option}>
          {({ isSelected }) => <><div className={s.optionText}><Text slot="label">{option.label}</Text>{option.description && <Text slot="description" className={s.description}>{option.description}</Text>}</div><Check size={14} aria-hidden="true" className={s.check} style={{ visibility: isSelected ? "visible" : "hidden" }} /></>}
        </ListBoxItem>}
      </ListBox>
    </Popover>
  </Primitive>;
}
