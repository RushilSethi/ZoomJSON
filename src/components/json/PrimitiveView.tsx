import { useState } from "react";
import { Check, Circle, Copy } from "lucide-react";
import { detectValueType, formatDate, truncateString } from "@/utils/formatValue";
import { SmartTextDisplay } from "@/components/ui/SmartTextDisplay";
import { CodeHighlighter } from "@/components/ui/CodeHighlighter";
import { HtmlRenderer } from "@/components/ui/HtmlRenderer";
import { HtmlArrayRenderer } from "@/components/ui/HtmlArrayRenderer";
import { detectCodeLanguage, isHtmlContent } from "@/utils/codeDetection";

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
        const codeDetection = detectCodeLanguage(str);
        const isHtml = isHtmlContent(str);
        
        // Check if this is a JSON string containing an array of HTML strings
        let parsedArray = null;
        try {
          parsedArray = JSON.parse(str);
        } catch {
          // Not valid JSON, continue with normal processing
        }
        
        // Handle array of HTML strings
        if (parsedArray && Array.isArray(parsedArray) && 
            parsedArray.every(item => typeof item === 'string') &&
            parsedArray.some(item => isHtmlContent(item))) {
          return (
            <div className="mt-2">
              <HtmlArrayRenderer 
                htmlArray={parsedArray}
                maxHeight={200}
              />
            </div>
          );
        }
        
        if (isHtml) {
          return (
            <div className="mt-2">
              <HtmlRenderer 
                html={str}
                maxHeight={200}
                showToggle={true}
                defaultView="rendered"
              />
            </div>
          );
        }
        
        if (codeDetection.isCode) {
          return (
            <div className="mt-2">
              <CodeHighlighter 
                code={str}
                language={codeDetection.language}
                maxLines={5}
                showLineNumbers={false}
                showCopyButton={false}
                showLanguageBadge={true}
              />
            </div>
          );
        }
        
        return (
          <SmartTextDisplay 
            text={str}
            maxLength={200}
            maxLines={3}
            className="font-mono"
          />
        );
      }

      default:
        return <span className="text-foreground font-mono">{String(value)}</span>;
    }
  };

  return (
    <div className="inline-flex items-start gap-1.5 group/prim">
      <div className="flex-1 min-w-0">
        {renderValue()}
      </div>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover/prim:opacity-100 transition-opacity duration-150 text-muted-foreground hover:text-foreground flex-shrink-0 mt-1"
        title="Copy value"
      >
        {copied ? <Check size={11} className="text-primary" /> : <Copy size={11} />}
      </button>
    </div>
  );
}
