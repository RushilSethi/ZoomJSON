import { useState } from 'react';
import parse, { HTMLReactParserOptions } from 'html-react-parser';
import { CodeHighlighter } from './CodeHighlighter';
import { Eye, Code, Copy, Check, ExternalLink } from 'lucide-react';
import { detectCodeLanguage, isHtmlContent } from '@/utils/codeDetection';

interface HtmlRendererProps {
  html: string;
  className?: string;
  maxHeight?: number;
  showToggle?: boolean;
  defaultView?: 'rendered' | 'code';
}

export function HtmlRenderer({ 
  html, 
  className = "",
  maxHeight = 400,
  showToggle = true,
  defaultView = 'rendered'
}: HtmlRendererProps) {
  const [viewMode, setViewMode] = useState<'rendered' | 'code'>(defaultView);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy HTML:', err);
    }
  };

  const parseOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode.type === 'tag' && domNode.name === 'script') {
        return <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm text-yellow-800">
          [Script content hidden for security]
        </div>;
      }
      
      if (domNode.type === 'tag' && domNode.name === 'style') {
        return <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm text-blue-800">
          [Style content hidden for security]
        </div>;
      }
      
      if (domNode.type === 'tag' && (domNode.name === 'pre' || domNode.name === 'code')) {
        const codeContent = domNode.children?.map(child => 
          child.type === 'text' ? child.data : ''
        ).join('') || '';
        
        if (codeContent.trim()) {
          const detection = detectCodeLanguage(codeContent);
          return (
            <CodeHighlighter 
              code={codeContent}
              language={detection.language}
              showLineNumbers={true}
              className="my-2"
            />
          );
        }
      }
      
      return undefined;
    }
  };

  const renderedContent = parse(html, parseOptions);

  if (!isHtmlContent(html)) {
    return (
      <div className={`bg-muted/50 p-4 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Code size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Plain Text</span>
        </div>
        <pre className="whitespace-pre-wrap break-words font-mono text-sm">
          {html}
        </pre>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {showToggle && (
        <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('rendered')}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                viewMode === 'rendered' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              <Eye size={14} />
              Rendered
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                viewMode === 'code' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              <Code size={14} />
              Code
            </button>
          </div>
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1 rounded-md text-sm hover:bg-muted transition-colors"
            title="Copy HTML"
          >
            {copied ? (
              <>
                <Check size={14} className="text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy
              </>
            )}
          </button>
        </div>
      )}

      <div className="relative max-w-full overflow-hidden">
        {viewMode === 'rendered' ? (
          <div 
            className="p-4 overflow-x-auto overflow-y-auto max-w-full"
            style={{ 
              maxHeight: viewMode === 'rendered' ? `${maxHeight}px` : 'none',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            <div className="prose prose-sm max-w-none break-words min-w-0" style={{ wordBreak: 'break-word' }}>
              {renderedContent}
            </div>
            {maxHeight && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            )}
          </div>
        ) : (
          <div className="overflow-auto max-w-full" style={{ maxHeight: `${maxHeight}px` }}>
            <CodeHighlighter 
              code={html}
              language="html"
              showLineNumbers={true}
              showCopyButton={false}
              showLanguageBadge={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
