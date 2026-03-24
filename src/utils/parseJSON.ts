export interface ParseResult {
  data: unknown;
  error: string | null;
  suggestion?: string;
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
      const suggestion = generateSuggestion(msg, input);
      return { data: null, error: msg, suggestion };
    }
  }
}

function generateSuggestion(errorMessage: string, input: string): string | undefined {
  const lowerError = errorMessage.toLowerCase();
  const lowerInput = input.toLowerCase();
  
  // Whitespace-related errors
  if (lowerError.includes('unexpected token') && lowerError.includes('json')) {
    return "Try trimming the JSON to remove extra whitespace or invisible characters.";
  }
  
  // Unicode/BOM errors
  if (lowerError.includes('unexpected token') && lowerError.includes('position 0')) {
    if (input.charCodeAt(0) === 0xFEFF || input.charCodeAt(0) === 0xFFFE) {
      return "The JSON contains a BOM (Byte Order Mark). Try removing invisible characters from the start.";
    }
    return "There might be invisible Unicode characters at the beginning. Try trimming the JSON.";
  }
  
  // Control character errors
  if (lowerError.includes('bad control character') || lowerError.includes('unrecognized token')) {
    return "The JSON contains invalid control characters. Try removing or escaping special characters.";
  }
  
  // Line ending issues
  if (lowerError.includes('unexpected token') && (input.includes('\r\n') || input.includes('\r'))) {
    return "Try normalizing line endings or removing extra whitespace between tokens.";
  }
  
  // Tab/space issues
  if (lowerError.includes('unexpected token') && (input.includes('\t') || /\s{2,}/.test(input))) {
    return "Try removing extra spaces or tabs and reformatting the JSON.";
  }
  
  // General whitespace suggestion for common parsing errors
  if (lowerError.includes('unexpected token') || lowerError.includes('json.parse')) {
    return "Try trimming the JSON to remove leading/trailing whitespace and invisible characters.";
  }
  
  return undefined;
}
