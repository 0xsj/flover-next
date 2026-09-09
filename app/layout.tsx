/* FIRST, above every other import, and load-bearing.
 *
 * Turbopack emits CSS chunks in import-graph order, so whatever the root layout
 * imports first is the first stylesheet in the document. `globals.css` is the
 * only file that carries `@layer reset, token, base, primitive, ...`, and a
 * layer order statement can only order the layers it has not already seen.
 *
 * Imported after the components, the component modules' `@layer primitive`
 * blocks reach the browser first, primitive/composition/screen get established
 * in that order, and the statement then appends reset/token/base BEHIND them —
 * at which point `button { border: none }` in @layer reset beats every button
 * primitive in the app. Measured in the project this was extracted from. */
import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RUNTIME_BOOT_SCRIPT } from "@/lib/runtime";

/* The variable names are the token contract, not the font's own name:
   `styles/tokens/typography.css` reads `--font-sans-src` and `--font-mono-src`
   and knows nothing about which family satisfies them. Swapping the family is
   this line and nothing else. */
const sans = Geist({ variable: "--font-sans-src", subsets: ["latin"], display: "swap" });
const mono = Geist_Mono({ variable: "--font-mono-src", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "flover-next",
  description: "A starter template.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    /* The boot script below writes `data-theme` and `data-density` onto this
     * element before React hydrates, and the server rendered it without them —
     * so React compares, finds attributes it did not write, and reports a
     * mismatch on the one element it cannot re-render.
     *
     * The attributes are correct; the comparison is what is wrong, because the
     * whole point of the script is to know something the server could not.
     *
     * This suppression is exactly one element deep — it covers attributes on
     * `<html>` and nothing below it — so it silences this and stays unable to
     * hide a real mismatch anywhere in the app. */
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        {/* Before anything paints, and therefore before anything renders.
         *
         * A stored preference read after mount costs a frame — the light first
         * paint, then the jump — and that frame is the most visible bug a theme
         * control can have. This is the only code in the app that runs ahead of
         * the bundle, which is why it is a string rather than a module. */}
        <script dangerouslySetInnerHTML={{ __html: RUNTIME_BOOT_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
