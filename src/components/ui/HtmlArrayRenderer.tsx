import { useState } from 'react';
import { HtmlRenderer } from './HtmlRenderer';
import { CodeHighlighter } from './CodeHighlighter';
import { detectCodeLanguage } from '@/utils/codeDetection';
import { ChevronDown, ChevronRight, Code, Eye } from 'lucide-react';

interface HtmlArrayRendererProps {
  htmlArray: string[];
  className?: string;
  maxHeight?: number;
}

export function HtmlArrayRenderer({ htmlArray, className = "", maxHeight = 400 }: HtmlArrayRendererProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [viewModes, setViewModes] = useState<Record<number, 'rendered' | 'code'>>({});

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleViewMode = (index: number) => {
    setViewModes(prev => ({
      ...prev,
      [index]: prev[index] === 'rendered' ? 'code' : 'rendered'
    }));
  };

  if (!Array.isArray(htmlArray)) {
    return (
      <div className={`bg-muted/50 p-4 rounded-lg ${className}`}>
        <p className="text-sm text-muted-foreground">Invalid HTML array format</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 w-full ${className}`}>
      {htmlArray.map((htmlContent, index) => {
        const isExpanded = expandedItems.has(index);
        const viewMode = viewModes[index] || 'rendered';
        const codeDetection = detectCodeLanguage(htmlContent);
        
        return (
          <div key={index} className="border rounded-lg overflow-hidden bg-background w-full">
            <div 
              className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleExpanded(index)}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(index);
                  }}
                  className="p-1 hover:bg-muted/50 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
                <span className="text-sm font-medium">HTML Sample {index + 1}</span>
                <span className="text-xs text-muted-foreground">
                  ({htmlContent.length} chars)
                </span>
              </div>
              
              {isExpanded && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleViewMode(index);
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                      viewMode === 'rendered' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Eye size={12} />
                    Rendered
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleViewMode(index);
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                      viewMode === 'code' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Code size={12} />
                    Code
                  </button>
                </div>
              )}
            </div>
            
            {isExpanded && (
              <div className="border-t w-full">
                {viewMode === 'rendered' ? (
                  <div className="p-3 w-full overflow-x-auto">
                    <div 
                      className="prose prose-sm max-w-none break-words"
                      dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                  </div>
                ) : (
                  <div className="w-full">
                    <CodeHighlighter 
                      code={htmlContent}
                      language="html"
                      showLineNumbers={true}
                      showCopyButton={false}
                      showLanguageBadge={false}
                      maxLines={10}
                    />
                  </div>
                )}
              </div>
            )}
            
            {!isExpanded && (
              <div className="px-3 pb-2">
                <div className="text-xs text-muted-foreground font-mono truncate">
                  {htmlContent.replace(/\s+/g, ' ').substring(0, 100)}...
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
