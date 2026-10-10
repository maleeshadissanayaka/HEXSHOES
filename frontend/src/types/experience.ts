import type { Product } from "./product";
export type ExperienceDialog =
  | { kind: "quick-view"; product: Product }
  | { kind: "campaign" }
  | { kind: "assistant" }
  | { kind: "search" }
  | { kind: "information"; title: string; description: string };
