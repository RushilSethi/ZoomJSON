import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from "lucide-react";

interface SmartTextDisplayProps {
  text: string;
  className?: string;
  maxLength?: number;
  maxLines?: number;
  showExpandButton?: boolean;
  isCode?: boolean;
  isHtml?: boolean;
}

export function SmartTextDisplay({ 
  text, 
  className = "", 
  maxLength = 200,
  maxLines = 3,
  showExpandButton = true,
  isCode = false,
  isHtml = false
}: SmartTextDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shouldTruncate, setShouldTruncate] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(getComputedStyle(textRef.current).lineHeight) || 20;
      const maxHeight = lineHeight * maxLines;
      setShouldTruncate(
        text.length > maxLength || 
        (textRef.current.scrollHeight > maxHeight && text.includes('\n'))
      );
    }
  }, [text, maxLines, maxLength]);

  const displayText = isExpanded ? text : 
    text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleToggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullscreen(!isFullscreen);
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background border-2 border-border p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Full Text View</h3>
            <button
              onClick={handleToggleFullscreen}
              className="p-2 rounded-md hover:bg-muted transition-colors"
            >
              <Minimize2 size={16} />
            </button>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap break-words font-mono text-sm">
              {text}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <div 
        ref={textRef}
        className={`font-mono text-sm break-words ${
          !isExpanded && shouldTruncate ? `line-clamp-${maxLines}` : ''
        }`}
      >
        {displayText}
      </div>
      
      {shouldTruncate && showExpandButton && (
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={handleToggleExpand}
            className="text-primary text-xs hover:underline flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={12} />
                Show less
              </>
            ) : (
              <>
                <ChevronDown size={12} />
                Show more
              </>
            )}
          </button>
          
          {text.length > maxLength * 2 && (
            <button
              onClick={handleToggleFullscreen}
              className="text-muted-foreground text-xs hover:text-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Maximize2 size={12} />
              Fullscreen
            </button>
          )}
        </div>
      )}
    </div>
  );
}
