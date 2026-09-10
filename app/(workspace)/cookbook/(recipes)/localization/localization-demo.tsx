"use client";
import { useState } from "react";
import { Card, CardBody, CardDescription, CardHeader, CardTitle, Stat } from "@/components/display";
import { Alert } from "@/components/feedback";
import { Button, Checkbox, Field } from "@/components/forms";
import { Flex } from "@/components/layout";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/overlays";
import { Text } from "@/components/typography";
import { createFormatters } from "@/lib/locale";
import { ScenarioChoice } from "../_components/scenario-choice";
import s from "../_components/recipe.module.css";

const languages = [
  { value: "en-US", label: "English", dir: "ltr", title: "Workspace overview", description: "Review the activity and presentation settings for your workspace.", count: "Processed records", amount: "Example amount", updated: "Last updated", missing: "Not available", action: "Review workspace presentation settings", dialog: "Presentation settings", body: "Dates, numbers and currency use the selected context. Changing language does not convert the amount or change the underlying instant.", close: "Close", reference: "Reference" },
  { value: "de-DE", label: "Deutsch · long text", dir: "ltr", title: "Arbeitsbereichsübersicht und Verarbeitungseinstellungen", description: "Überprüfen Sie die aktuellen Verarbeitungsinformationen und die sprachabhängigen Darstellungseinstellungen Ihres Arbeitsbereichs.", count: "Erfolgreich verarbeitete Datensätze", amount: "Beispielbetrag", updated: "Zeitpunkt der letzten Aktualisierung", missing: "Nicht verfügbar", action: "Darstellungseinstellungen für den gesamten Arbeitsbereich überprüfen", dialog: "Arbeitsbereichsdarstellungseinstellungen", body: "Datum, Zahlen und Währungsbeträge verwenden die ausgewählten Einstellungen. Eine andere Sprache verändert weder den Betrag noch den zugrunde liegenden Zeitpunkt.", close: "Schließen", reference: "Referenznummer" },
  { value: "ar-EG", label: "العربية · RTL", dir: "rtl", title: "نظرة عامة على مساحة العمل", description: "راجع النشاط وإعدادات العرض الخاصة بمساحة العمل، مع الحفاظ على وضوح الأرقام والتواريخ والنصوص الطويلة.", count: "السجلات التي تمت معالجتها", amount: "مبلغ توضيحي", updated: "آخر تحديث", missing: "غير متاح", action: "مراجعة إعدادات العرض الخاصة بمساحة العمل", dialog: "إعدادات العرض", body: "تستخدم التواريخ والأرقام والعملات الإعدادات المحددة. تغيير اللغة لا يحوّل المبلغ ولا يغيّر اللحظة الزمنية الأصلية.", close: "إغلاق", reference: "المرجع" },
] as const;
type Language = typeof languages[number]["value"];
const instant = Date.UTC(2026, 8, 10, 0, 30);
export function LocalizationDemo() {
  const [language, setLanguage] = useState<Language>("en-US");
  const [timeZone, setTimeZone] = useState("UTC"), [currency, setCurrency] = useState("USD"), [invalid, setInvalid] = useState(false);
  const copy = languages.find(option => option.value === language)!;
  const format = createFormatters({ locale: language, timeZone, currency });
  if (!format.ok) return <Alert tone="warn" title="Formatting unavailable">{format.error.message}</Alert>;
  const f = format.value;
  return <>
    <Flex gap={5} wrap><ScenarioChoice label="Language and direction" value={language} options={languages} onChange={setLanguage} /><ScenarioChoice label="Time zone" value={timeZone} options={[{ value: "UTC", label: "UTC" }, { value: "America/New_York", label: "New York" }, { value: "Europe/Istanbul", label: "Istanbul" }, { value: "Asia/Tokyo", label: "Tokyo" }]} onChange={setTimeZone} /><ScenarioChoice label="Currency presentation" value={currency} options={[{ value: "USD", label: "USD" }, { value: "EUR", label: "EUR" }, { value: "JPY", label: "JPY" }]} onChange={setCurrency} /></Flex>
    <Field label="Simulate invalid source values" hint="Invalid values render as unavailable; they are never presented as zero or NaN.">{control => <Checkbox {...control} checked={invalid} onCheckedChange={value => setInvalid(value === true)} />}</Field>
    {invalid && <Alert tone="warn" title="Source values could not be formatted">The formatter rejected the invalid number and instant. This region explicitly presents missing information.</Alert>}
    <section aria-label="Localized workspace preview" lang={language} dir={copy.dir} className={s.preview}>
      <Card><CardHeader><CardTitle level={2}>{copy.title}</CardTitle><CardDescription>{copy.description}</CardDescription></CardHeader><CardBody><div className={s.preview}>
        <div className={s.stats}><Stat label={copy.count} value={f.number(invalid ? NaN : 1234567.89).unwrapOr(copy.missing)} /><Stat label={copy.amount} value={f.money(invalid ? NaN : 1299.5).unwrapOr(copy.missing)} /></div>
        <div><Text size="sm" tone="muted">{copy.updated}</Text><Text>{f.instant(invalid ? NaN : instant).unwrapOr(copy.missing)}</Text></div>
        <Text size="sm">{copy.reference}: <bdi dir="ltr" className={s.identifier}>INV-2026-0042 / api.example.com</bdi></Text>
        <div><Dialog><DialogTrigger asChild><Button className={s.wrap}>{copy.action}</Button></DialogTrigger><DialogContent lang={language} dir={copy.dir} title={copy.dialog} description={copy.body} closeLabel={copy.close}><Flex direction="column" gap={5}><Text><bdi dir="ltr">{timeZone} · {currency}</bdi></Text><DialogClose asChild><Button className={s.wrap}>{copy.close}</Button></DialogClose></Flex></DialogContent></Dialog></div>
      </div></CardBody></Card>
    </section>
    <Text size="sm" tone="muted">Frontend: use an explicit formatting context and language catalog, allow text to wrap, and pass direction to portal content. Backend: send unambiguous instants and agreed amount units; supply translated content where appropriate. Currency selection changes presentation only, with no exchange-rate conversion. This is a formatting and layout foundation, not an application-wide translation rollout.</Text>
  </>;
}
