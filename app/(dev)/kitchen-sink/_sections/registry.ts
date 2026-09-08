import type { ComponentType } from "react";
import { TokensSection } from "./tokens";
import { TypographySection } from "./typography";

/** The one list. The page composes from it and the header nav is rendered from
 *  it, so a section cannot exist and be unreachable — and the rail derives
 *  itself from the DOM for the same reason one level down. */
export type Entry = { id: string; label: string; Section: ComponentType };

export const SECTIONS: readonly Entry[] = [
  { id: "tokens", label: "Tokens", Section: TokensSection },
  { id: "typography", label: "Typography", Section: TypographySection },
];
