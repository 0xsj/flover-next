"use client";
import { useState } from "react";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/display";
import { Checkbox, Field, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/forms";
import { Flex } from "@/components/layout";
import type { ItemReadMode, ItemSaveMode, ItemWorkflow } from "@/lib/root/item-workflow";
import s from "./items.module.css";

export function Scenarios({ root }: { root: ItemWorkflow }) {
  const [read, setRead] = useState<ItemReadMode>("success"), [save, setSave] = useState<ItemSaveMode>("success");
  const [check, setCheck] = useState(false);
  const reads: Array<[ItemReadMode, string]> = [["success", "Successful read"], ["unavailable", "Read unavailable"], ["malformed", "Malformed response"]];
  const saves: Array<[ItemSaveMode, string]> = [["success", "Save successfully"], ["refused", "Server refuses the name"], ["conflict", "Item changes elsewhere"], ["lost-response", "Save commits, response is lost"], ["not-delivered", "Request is not delivered"], ["held", "Hold the save response"]];
  return <Card><CardHeader><CardTitle level={2}>Try the failure paths</CardTitle><CardDescription>These controls affect subsequent demo requests. They never change your application’s backend.</CardDescription></CardHeader><CardBody><Flex gap={5} wrap>
    <div className={s.choice}><Field label="Item read behavior">{control => <Select value={read} onValueChange={value => { const mode = reads.find(([mode]) => mode === value)?.[0]; if (mode) { setRead(mode); root.setReadMode(mode); } }}><SelectTrigger {...control}><SelectValue /></SelectTrigger><SelectContent>{reads.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>}</Field></div>
    <div className={s.choice}><Field label="Item save behavior">{control => <Select value={save} onValueChange={value => { const mode = saves.find(([mode]) => mode === value)?.[0]; if (mode) { setSave(mode); root.setSaveMode(mode); } }}><SelectTrigger {...control}><SelectValue /></SelectTrigger><SelectContent>{saves.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>}</Field></div>
    <Field label="Make receipt checks fail">{control => <Checkbox {...control} checked={check} onCheckedChange={value => { setCheck(value === true); root.setChecksFail(value === true); }} />}</Field>
  </Flex></CardBody></Card>;
}
