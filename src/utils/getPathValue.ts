export function getValueAtPath(data: unknown, path: string[]): unknown {
  let current = data;
  for (const key of path) {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      current = current[parseInt(key, 10)];
    } else if (typeof current === "object") {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

export function pathToString(path: string[]): string {
  return path.reduce((acc, key, i) => {
    if (i === 0) return key;
    if (/^\d+$/.test(key)) return `${acc}[${key}]`;
    return `${acc}.${key}`;
  }, "$");
}
