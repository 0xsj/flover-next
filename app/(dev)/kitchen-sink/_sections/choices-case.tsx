"use client";

import { useState } from "react";
import {
  Checkbox, Field, Fieldset, Label, Radio, RadioGroup,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Switch, Toggle,
} from "@/components/forms";
import { Case, Row } from "../_components/section";
import s from "../_components/sink.module.css";

/** The choice controls. Client-side because every one of them is stateful, and
 *  their states are the point. */
export function ChoicesCase() {
  const [mixed, setMixed] = useState<boolean | "indeterminate">("indeterminate");

  return (
    <Case
      title="Choices"
      note="checkbox · switch · toggle · radio · select — four roles, not one look"
    >
      <Row label="checkbox">
        <span className={s.choice}><Checkbox id="c1" defaultChecked /><Label htmlFor="c1">Checked</Label></span>
        <span className={s.choice}><Checkbox id="c2" /><Label htmlFor="c2">Unchecked</Label></span>
        <span className={s.choice}>
          <Checkbox id="c3" checked={mixed} onCheckedChange={setMixed} />
          <Label htmlFor="c3">Indeterminate — a third state, not a styling</Label>
        </span>
        <span className={s.choice}><Checkbox id="c4" disabled defaultChecked /><Label htmlFor="c4">Disabled</Label></span>
      </Row>

      <Row label="switch">
        <span className={s.choice}><Switch id="s1" defaultChecked /><Label htmlFor="s1">On</Label></span>
        <span className={s.choice}><Switch id="s2" /><Label htmlFor="s2">Off</Label></span>
        <span className={s.choice}><Switch id="s3" disabled /><Label htmlFor="s3">Disabled</Label></span>
      </Row>

      <Row label="toggle">
        <Toggle aria-label="Bold" size="icon">B</Toggle>
        <Toggle defaultPressed>Pressed</Toggle>
        <Toggle shape="pill" size="sm">Filter</Toggle>
        <Toggle disabled>Disabled</Toggle>
      </Row>

      <Row label="radio">
        <Fieldset legend="Notify me" hint="Arrows move within the group; Tab leaves it.">
          <RadioGroup defaultValue="email">
            <span className={s.choice}><Radio value="email" id="r1" /><Label htmlFor="r1">By email</Label></span>
            <span className={s.choice}><Radio value="sms" id="r2" /><Label htmlFor="r2">By SMS</Label></span>
            <span className={s.choice}><Radio value="none" id="r3" /><Label htmlFor="r3">Not at all</Label></span>
          </RadioGroup>
        </Fieldset>
      </Row>

      <Row label="select">
        <div className={s.selectWidth}>
          <Field label="Region" hint="A value, not an action.">
            {(control) => (
              <Select defaultValue="eu">
                <SelectTrigger {...control}><SelectValue placeholder="Choose one" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="eu">Europe</SelectItem>
                  <SelectItem value="us">North America</SelectItem>
                  <SelectItem value="ap">Asia Pacific</SelectItem>
                </SelectContent>
              </Select>
            )}
          </Field>
        </div>
      </Row>

      <p className={s.limits}>
        <strong>Three of these look alike and are three different controls.</strong>{" "}
        A <em>checkbox</em> is a value you submit — nothing happens until the form
        does. A <em>switch</em> is a setting that takes effect immediately, so one
        inside a form with a Save button promises something the form will not
        deliver. A <em>toggle</em> is a button that stays pressed and changes the
        view rather than the data. Each announces itself differently, so picking
        wrong tells a reader something untrue about what will happen.
      </p>

      <p className={s.limits}>
        <strong>A select picks a value; a menu picks an action.</strong> They look
        nearly identical and are announced completely differently — one as a
        combobox with a current value, the other as a list of commands. A menu
        used for a value leaves a reader unable to discover what is selected.
      </p>

      <p className={s.limits}>
        <strong>Indeterminate is a state, not a variant.</strong> It reports{" "}
        <code>aria-checked=&quot;mixed&quot;</code>. A variant is chosen by the
        author; a state comes from the data — and it is one of the few controls
        that can carry three states without inventing a widget.
      </p>
    </Case>
  );
}
