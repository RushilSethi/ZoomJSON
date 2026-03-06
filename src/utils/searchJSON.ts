export interface SearchMatch {
  path: string[];
  key: string;
  value: string;
  type: "key" | "value";
}

export function searchJSON(data: unknown, query: string): SearchMatch[] {
  if (!query.trim()) return [];
  const results: SearchMatch[] = [];
  const lowerQuery = query.toLowerCase();

  function traverse(current: unknown, path: string[]) {
    if (results.length >= 100) return; // cap results

    if (current === null || current === undefined) return;

    if (Array.isArray(current)) {
      current.forEach((item, i) => traverse(item, [...path, String(i)]));
    } else if (typeof current === "object") {
      for (const [key, value] of Object.entries(current as Record<string, unknown>)) {
        if (key.toLowerCase().includes(lowerQuery)) {
          results.push({ path: [...path, key], key, value: String(value), type: "key" });
        }
        if (typeof value === "string" && value.toLowerCase().includes(lowerQuery)) {
          results.push({ path: [...path, key], key, value, type: "value" });
        } else if (typeof value === "number" && String(value).includes(query)) {
          results.push({ path: [...path, key], key, value: String(value), type: "value" });
        }
        traverse(value, [...path, key]);
      }
    }
  }

  traverse(data, []);
  return results;
}
