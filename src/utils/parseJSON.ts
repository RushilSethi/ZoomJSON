export interface ParseResult {
  data: unknown;
  error: string | null;
}

export function parseJSON(input: string): ParseResult {
  if (!input.trim()) return { data: null, error: null };

  try {
    const data = JSON.parse(input);
    return { data, error: null };
  } catch (e) {
    // Try trimmed version as fallback (handles leading/trailing whitespace)
    try {
      const data = JSON.parse(input.trim());
      return { data, error: null };
    } catch (e2) {
      const msg = e2 instanceof SyntaxError ? e2.message : "Invalid JSON";
      return { data: null, error: msg };
    }
  }
}
