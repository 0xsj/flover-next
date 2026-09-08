"use client";

import { useEffect, useState } from "react";
import s from "./theme-switch.module.css";

/* Deliberately local to the dev route rather than in `lib/runtime` or
   `components/chrome`. The real one belongs in a tier neither of which is built
   yet, and a placeholder there would be a modelled tier with no caller. This is
   scaffolding for a page whose whole job is to be looked at. */

type Choice = "system" | "light" | "dark";
const CHOICES: Choice[] = ["system", "light", "dark"];

export function ThemeSwitch() {
  const [choice, setChoice] = useState<Choice>("system");

  useEffect(() => {
    const root = document.documentElement;
    if (choice === "system") delete root.dataset.theme;
    else root.dataset.theme = choice;
  }, [choice]);

  return (
    <div className={s.group} role="group" aria-label="Theme">
      {CHOICES.map((c) => (
        <button
          key={c}
          type="button"
          className={s.option}
          aria-pressed={choice === c}
          onClick={() => setChoice(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
