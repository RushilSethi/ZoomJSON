export function detectUniformArray(arr: unknown[]): string[] | null {
  if (arr.length === 0) return null;
  if (!arr.every((item) => typeof item === "object" && item !== null && !Array.isArray(item)))
    return null;

  const keys = Object.keys(arr[0] as Record<string, unknown>);
  if (keys.length === 0) return null;

  const isUniform = arr.every((item) => {
    const itemKeys = Object.keys(item as Record<string, unknown>);
    return keys.length === itemKeys.length && keys.every((k) => itemKeys.includes(k));
  });

  return isUniform ? keys : null;
}
