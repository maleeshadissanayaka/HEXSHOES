import type { PresentationProduct } from "./product";
export type ExperienceDialog =
  | { kind: "quick-view"; product: PresentationProduct }
  | { kind: "campaign" }
  | { kind: "assistant" }
  | { kind: "search" }
  | { kind: "information"; title: string; description: string };
