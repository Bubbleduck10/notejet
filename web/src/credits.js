// Frontend estimate — mirror of backend creditCost (keep in sync with
// backend/src/credits.js). Used to preview cost before generating.
export function estimateCost(text = "") {
  const chars = (text || "").length;
  if (chars <= 8000) return 1; // screenshot, short note, short video
  if (chars <= 25000) return 2; // medium video / long article
  return 3; // long video / large document
}
