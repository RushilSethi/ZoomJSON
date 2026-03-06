export interface DiffEntry {
  path: string[];
  type: "added" | "removed" | "changed";
  oldValue?: unknown;
  newValue?: unknown;
}

export function diffJSON(a: unknown, b: unknown, path: string[] = []): DiffEntry[] {
  const results: DiffEntry[] = [];

  if (a === b) return results;

  if (a === null || a === undefined || b === null || b === undefined || typeof a !== typeof b) {
    if (a !== undefined && a !== null && (b === undefined || b === null)) {
      results.push({ path, type: "removed", oldValue: a });
    } else if ((a === undefined || a === null) && b !== undefined && b !== null) {
      results.push({ path, type: "added", newValue: b });
    } else {
      results.push({ path, type: "changed", oldValue: a, newValue: b });
    }
    return results;
  }

  if (typeof a !== "object") {
    if (a !== b) results.push({ path, type: "changed", oldValue: a, newValue: b });
    return results;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
      const childPath = [...path, String(i)];
      if (i >= a.length) {
        results.push({ path: childPath, type: "added", newValue: b[i] });
      } else if (i >= b.length) {
        results.push({ path: childPath, type: "removed", oldValue: a[i] });
      } else {
        results.push(...diffJSON(a[i], b[i], childPath));
      }
    }
    return results;
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    results.push({ path, type: "changed", oldValue: a, newValue: b });
    return results;
  }

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const allKeys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);

  for (const key of allKeys) {
    const childPath = [...path, key];
    if (!(key in aObj)) {
      results.push({ path: childPath, type: "added", newValue: bObj[key] });
    } else if (!(key in bObj)) {
      results.push({ path: childPath, type: "removed", oldValue: aObj[key] });
    } else {
      results.push(...diffJSON(aObj[key], bObj[key], childPath));
    }
  }

  return results;
}
