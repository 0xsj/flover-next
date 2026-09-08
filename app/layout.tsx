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
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
