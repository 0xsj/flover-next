"use client";

import { DateRangePicker as Primitive, I18nProvider } from "react-aria-components";
import { cn } from "@/lib/kernel";
import { PickerLabel, PickerMessages } from "../_shared/picker-field";
import { DateControl, DatePopover } from "../date-picker/date-picker";
import { calendarRange, dateConstraints, rangeAvailabilityError, type DateControlProps, type DateRange } from "../date-picker/date-value";
import field from "../_shared/picker.module.css";

export type { DateRange } from "../date-picker/date-value";
export type DateRangePickerProps = DateControlProps & {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onValueChange?: (value: DateRange | null) => void;
  startName?: string;
  endName?: string;
};

export function DateRangePicker(props: DateRangePickerProps) {
  const { label, hint, error, required, disabled, readOnly, id, className, locale = "en-GB", value, defaultValue, onValueChange, startName, endName } = props;
  return <I18nProvider locale={new Intl.Locale(locale, { calendar: "gregory" }).toString()}>
    <Primitive id={id} startName={startName} endName={endName} className={cn(field.field, className)}
      value={value === undefined ? undefined : value === null ? null : calendarRange(value)}
      defaultValue={defaultValue ? calendarRange(defaultValue) : undefined}
      onChange={onValueChange ? (next) => onValueChange(next ? { start: next.start.toString(), end: next.end.toString() } : null) : undefined}
      {...dateConstraints(props)} allowsNonContiguousRanges={false}
      validate={(next) => rangeAvailabilityError(next, props.isDateUnavailable)}
      isDisabled={disabled} isReadOnly={readOnly} isRequired={required} isInvalid={Boolean(error) || undefined}
      granularity="day" shouldForceLeadingZeros
    >{({ state }) => <>
      <PickerLabel label={label} required={required} />
      <DateControl label={label} range clear={() => state.setValue(null)} canClear={Boolean(state.value?.start || state.value?.end) && !disabled && !readOnly} />
      <PickerMessages hint={hint} error={error} />
      <DatePopover label={label} range />
    </>}</Primitive>
  </I18nProvider>;
}
