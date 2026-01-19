// Very small heuristic extractor to update startup_memory when user provides labelled fields.
// In production you might use a dedicated extraction model or structured input from the frontend.

export function extractMemoryFromText(text) {
  if (!text || typeof text !== "string") return null;
  const result = {};

  // simple regexes for labelled lines like 'idea: ...' or 'Industry: ...'
  const fields = ["idea", "stage", "industry", "problem", "solution"];
  let found = false;

  for (const field of fields) {
    const re = new RegExp(`${field}\\s*:\\s*(.+)`, "i");
    const m = text.match(re);
    if (m && m[1]) {
      result[field] = m[1].trim();
      found = true;
    }
  }

  return found ? result : null;
}
