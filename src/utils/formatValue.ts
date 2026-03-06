import { formatDistanceToNow } from "date-fns";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;

export type ValueType = "string" | "number" | "boolean" | "null" | "date" | "object" | "array";

export function detectValueType(value: unknown): ValueType {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  if (typeof value === "string" && ISO_DATE_REGEX.test(value)) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return "date";
  }
  return "string";
}

export function formatDate(value: string): { relative: string; raw: string } {
  const d = new Date(value);
  return {
    relative: formatDistanceToNow(d, { addSuffix: true }),
    raw: d.toLocaleString(),
  };
}

export function truncateString(value: string, maxLength = 120): { text: string; truncated: boolean } {
  if (value.length <= maxLength) return { text: value, truncated: false };
  return { text: value.slice(0, maxLength), truncated: true };
}
