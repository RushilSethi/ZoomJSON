import { useState } from "react";
import { Check, Circle, Copy } from "lucide-react";
import { detectValueType, formatDate, truncateString } from "@/utils/formatValue";

interface PrimitiveViewProps {
  value: unknown;
  copyValue?: string;
}

export function PrimitiveView({ value, copyValue }: PrimitiveViewProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const type = detectValueType(value);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(copyValue ?? String(value ?? "null"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const renderValue = () => {
    switch (type) {
      case "null":
        return <span className="text-type-null italic text-xs">null</span>;

      case "boolean":
        return (
          <span className="flex items-center gap-1.5">
            <Circle
              size={7}
              className={value ? "fill-type-boolean-true text-type-boolean-true" : "fill-type-boolean-false text-type-boolean-false"}
            />
            <span className={value ? "text-type-boolean-true" : "text-type-boolean-false"}>
              {String(value)}
            </span>
          </span>
        );

      case "number":
        return <span className="text-type-number font-mono">{String(value)}</span>;

      case "date": {
        const { relative, raw } = formatDate(value as string);
        return (
          <span className="text-type-date cursor-help" title={raw}>
            {relative}
          </span>
        );
      }

      case "string": {
        const str = value as string;
        const { text, truncated } = truncateString(str);
        if (truncated && !expanded) {
          return (
            <span className="font-mono">
              <span className="text-foreground">{text}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(true);
                }}
                className="ml-1 text-primary text-xs hover:underline"
              >
                …more
              </button>
            </span>
          );
        }
        if (truncated && expanded) {
          return (
            <span className="font-mono">
              <span className="text-foreground break-all">{str}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(false);
                }}
                className="ml-1 text-primary text-xs hover:underline"
              >
                less
              </button>
            </span>
          );
        }
        return <span className="text-foreground font-mono">{str}</span>;
      }

      default:
        return <span className="text-foreground font-mono">{String(value)}</span>;
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5 group/prim">
      {renderValue()}
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover/prim:opacity-100 transition-opacity duration-150 text-muted-foreground hover:text-foreground"
        title="Copy value"
      >
        {copied ? <Check size={11} className="text-primary" /> : <Copy size={11} />}
      </button>
    </span>
  );
}
