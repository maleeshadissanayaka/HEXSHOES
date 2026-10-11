export const VISUAL_SEARCH_MAX_BYTES = 5 * 1024 * 1024;
export const VISUAL_SEARCH_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export function validateVisualSearchFile(file: File): string | undefined {
  if (!VISUAL_SEARCH_TYPES.has(file.type)) return "Choose a JPEG, PNG, or WebP image.";
  if (file.size > VISUAL_SEARCH_MAX_BYTES) return "Choose an image no larger than 5 MB.";
  return undefined;
}
export function createVisualSearchForm(file: File, topK = 4): FormData {
  const form = new FormData(); form.set("image", file); form.set("topK", String(topK)); return form;
}
export function createMultimodalForm(file: File | undefined, text: string | undefined, topK = 4): FormData {
  const form = new FormData();
  if (file) form.set("image", file);
  if (text?.trim()) form.set("text", text.trim());
  form.set("topK", String(topK));
  return form;
}
export type VisualSearchState = "idle" | "selected" | "searching" | "success" | "empty" | "error";
export const resultState = (count: number): VisualSearchState => count > 0 ? "success" : "empty";
export const formatSimilarity = (score: number) => `Similarity ${score.toFixed(3)}`;
export const visualSearchErrorMessage = (error: unknown) => error instanceof Error ? error.message : "Visual search is temporarily unavailable.";
