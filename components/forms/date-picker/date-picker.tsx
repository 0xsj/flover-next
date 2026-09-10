"use client";

import {
  Button, Calendar, CalendarCell, CalendarGrid, CalendarGridBody, CalendarGridHeader,
  CalendarHeaderCell, DateInput, DatePicker as Primitive, DateSegment, Dialog,
  Group, Heading, I18nProvider, Popover, RangeCalendar,
} from "react-aria-components";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "@/components/utility";
import { cn } from "@/lib/kernel";
import { PickerLabel, PickerMessages } from "../_shared/picker-field";
import { calendarDate, dateConstraints, type DateControlProps } from "./date-value";
import field from "../_shared/picker.module.css";
import surface from "../../surface.module.css";
import s from "./date-picker.module.css";

export type DatePickerProps = DateControlProps & {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  name?: string;
  form?: string;
};

export function DatePicker(props: DatePickerProps) {
  const { label, hint, error, required, disabled, readOnly, id, className, locale = "en-GB", value, defaultValue, onValueChange, name, form } = props;
  return <I18nProvider locale={new Intl.Locale(locale, { calendar: "gregory" }).toString()}>
    <Primitive id={id} name={name} form={form} className={cn(field.field, className)}
      value={value === undefined ? undefined : value === null ? null : calendarDate(value)}
      defaultValue={defaultValue ? calendarDate(defaultValue) : undefined}
      onChange={onValueChange ? (next) => onValueChange(next?.toString() ?? null) : undefined}
      {...dateConstraints(props)} isDisabled={disabled} isReadOnly={readOnly} isRequired={required}
      isInvalid={Boolean(error) || undefined} granularity="day" shouldForceLeadingZeros
    >{({ state }) => <>
      <PickerLabel label={label} required={required} />
      <DateControl label={label} clear={() => state.setValue(null)} canClear={Boolean(state.value) && !disabled && !readOnly} />
      <PickerMessages hint={hint} error={error} />
      <DatePopover label={label} />
    </>}</Primitive>
  </I18nProvider>;
}

/** Internal composition shared by single and range fields. */
export function DateControl({ label, range = false, clear, canClear }: { label: string; range?: boolean; clear: () => void; canClear: boolean }) {
  return <Group className={cn(field.control, s.control)}>
    <div className={s.inputs}>
      <DateInput slot={range ? "start" : undefined} className={s.input}>{(segment) => <DateSegment segment={segment} className={s.segment} />}</DateInput>
      {range && <><span className={s.rangeSeparator} aria-hidden="true">–</span><DateInput slot="end" className={s.input}>{(segment) => <DateSegment segment={segment} className={s.segment} />}</DateInput></>}
    </div>
    {canClear && <Button slot={null} className={field.iconButton} aria-label={`Clear ${label}`} onPress={clear}><X size={13} aria-hidden="true" /></Button>}
    <Button className={field.iconButton} aria-label="Choose"><CalendarDays size={15} aria-hidden="true" /></Button>
  </Group>;
}

export function DatePopover({ label, range = false }: { label: string; range?: boolean }) {
  const calendar = <>
        <div className={s.header}>
          <Button slot="previous" className={field.iconButton}><ChevronLeft size={15} aria-hidden="true" /></Button>
          <Heading className={s.heading} />
          <Button slot="next" className={field.iconButton}><ChevronRight size={15} aria-hidden="true" /></Button>
        </div>
        <CalendarGrid className={s.grid} weekdayStyle="short">
          <CalendarGridHeader>{(day) => <CalendarHeaderCell className={s.weekday}>{day}</CalendarHeaderCell>}</CalendarGridHeader>
          <CalendarGridBody>{(date) => <CalendarCell date={date} className={s.day} />}</CalendarGridBody>
        </CalendarGrid>
  </>;
  return <Popover placement="bottom start" offset={6} className={cn(surface.elevated, field.popover, s.popover)}>
    <Dialog aria-label={`Choose ${label}`} className={s.dialog}>
      {range ? <RangeCalendar className={s.calendar}>{calendar}</RangeCalendar> : <Calendar className={s.calendar}>{calendar}</Calendar>}
      <p className={s.help}>{range ? "Choose a start and end date." : "Choose a date."} Arrow keys move between days.</p>
    </Dialog>
  </Popover>;
}
