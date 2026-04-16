/**
 * Parses the structured KEY: value text that n8n agents return.
 * Handles multi-line values (lines not starting with UPPERCASE_KEY:).
 */
export function parseN8nOutput(raw: string): Record<string, string> {
  if (!raw) return {};
  const result: Record<string, string> = {};
  let currentKey: string | null = null;
  let currentLines: string[] = [];

  for (const line of raw.split("\n")) {
    // Match a line that starts with UPPER_CASE_KEY: (with optional spaces around colon)
    const match = line.match(/^([A-Z][A-Z0-9_]+)\s*:\s*(.*)/);
    if (match) {
      // Flush previous key
      if (currentKey) {
        result[currentKey] = currentLines.join("\n").trim();
      }
      currentKey = match[1]!;
      currentLines = [match[2]!];
    } else if (currentKey) {
      // Continuation line for the current value
      currentLines.push(line);
    }
  }
  // Flush last key
  if (currentKey) {
    result[currentKey] = currentLines.join("\n").trim();
  }
  return result;
}
