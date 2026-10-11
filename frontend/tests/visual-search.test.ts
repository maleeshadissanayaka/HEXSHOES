import assert from "node:assert/strict";
import test from "node:test";
import { createVisualSearchForm, formatSimilarity, resultState, validateVisualSearchFile, visualSearchErrorMessage } from "../src/components/home/visualSearchState.ts";

test("image selection accepts supported files and rejects invalid type or size", () => {
  assert.equal(validateVisualSearchFile(new File(["image"], "shoe.webp", { type: "image/webp" })), undefined);
  assert.match(validateVisualSearchFile(new File(["text"], "shoe.txt", { type: "text/plain" })) ?? "", /JPEG/);
  assert.match(validateVisualSearchFile(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.png", { type: "image/png" })) ?? "", /5 MB/);
});

test("multipart request construction includes the image and bounded topK", () => {
  const file = new File(["image"], "shoe.png", { type: "image/png" });
  const form = createVisualSearchForm(file, 4);
  assert.equal(form.get("image"), file);
  assert.equal(form.get("topK"), "4");
});

test("view helpers represent success, empty, errors, and honest similarity wording", () => {
  assert.equal(resultState(2), "success");
  assert.equal(resultState(0), "empty");
  assert.equal(visualSearchErrorMessage(new Error("Visual search is temporarily unavailable.")), "Visual search is temporarily unavailable.");
  assert.equal(formatSimilarity(0.8249), "Similarity 0.825");
  assert.doesNotMatch(formatSimilarity(0.8249), /%|confidence|probability/i);
});
