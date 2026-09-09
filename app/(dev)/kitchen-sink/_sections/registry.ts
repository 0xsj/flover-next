import type { ComponentType } from "react";
import { FormsSection } from "./forms";
import { DataSection } from "./data";
import {
  ChromeSection, DisplaySection, FeedbackSection, LayoutSection,
  NavigationSection, OverlaysSection, UtilitySection,
} from "./groups";
import { TokensSection } from "./tokens";
import { TypographySection } from "./typography";

/** The one list. The page composes from it and the header nav is rendered from
 *  it, so a section cannot exist and be unreachable — and the rail derives
 *  itself from the DOM for the same reason one level down. */
export type Entry = { id: string; label: string; Section: ComponentType };

export const SECTIONS: readonly Entry[] = [
  { id: "tokens", label: "Tokens", Section: TokensSection },
  { id: "typography", label: "Typography", Section: TypographySection },
  { id: "forms", label: "Forms", Section: FormsSection },
  { id: "display", label: "Display", Section: DisplaySection },
  { id: "feedback", label: "Feedback", Section: FeedbackSection },
  { id: "layout", label: "Layout", Section: LayoutSection },
  { id: "navigation", label: "Navigation", Section: NavigationSection },
  { id: "overlays", label: "Overlays", Section: OverlaysSection },
  { id: "utility", label: "Utility", Section: UtilitySection },
  { id: "chrome", label: "Chrome", Section: ChromeSection },
  { id: "data", label: "Data and failures", Section: DataSection },
];
