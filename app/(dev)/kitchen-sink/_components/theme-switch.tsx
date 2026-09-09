"use client";

import { DENSITIES, THEMES } from "@/lib/runtime";
import { useDensity, useHydrateRuntime, useTheme } from "@/lib/runtime/hooks";
import s from "./theme-switch.module.css";

/* Was local to this route because `lib/runtime` did not exist. It does now, so
   the state lives there and this is only the control. */

export function ThemeSwitch() {
  useHydrateRuntime();
  const theme = useTheme();
  const density = useDensity();

  return (
    <div className={s.row}>
      <div className={s.group} role="group" aria-label="Theme">
        {THEMES.map((t) => (
          <button
            key={t}
            type="button"
            className={s.option}
            aria-pressed={theme.choice === t}
            onClick={() => theme.set(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={s.group} role="group" aria-label="Density">
        {DENSITIES.map((d) => (
          <button
            key={d}
            type="button"
            className={s.option}
            aria-pressed={density.value === d}
            onClick={() => density.set(d)}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
