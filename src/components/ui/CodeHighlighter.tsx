import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus as darkTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { detectCodeLanguage, formatCodeForDisplay, CodeLanguage } from '@/utils/codeDetection';
import { useState } from 'react';
import { Copy, Check, Code, Eye } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface CodeHighlighterProps {
  code: string;
  language?: CodeLanguage;
  className?: string;
  showLineNumbers?: boolean;
  maxLines?: number;
  showCopyButton?: boolean;
  showLanguageBadge?: boolean;
}

export function CodeHighlighter({ 
  code, 
  language: propLanguage, 
  className = "",
  showLineNumbers = true,
  maxLines = 20,
  showCopyButton = true,
  showLanguageBadge = true
}: CodeHighlighterProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  
  const detection = propLanguage ? 
    { language: propLanguage, confidence: 100, isCode: true } : 
    detectCodeLanguage(code);
  
  const formattedCode = formatCodeForDisplay(code, detection.language);
  const lines = formattedCode.split('\n');
  const shouldTruncate = lines.length > maxLines;
  const displayCode = isExpanded || !shouldTruncate ? 
    formattedCode : 
    lines.slice(0, maxLines).join('\n');

  // Determine syntax highlighting theme based on app theme
  const getSyntaxTheme = () => {
    // Dark themes: midnight, synthwave, champion
    if (theme === 'dark' || theme === 'synthwave' || theme === 'champion') {
      return darkTheme;
    }
    // Light themes: cupcake, autumn
    return oneLight;
  };

  const syntaxTheme = getSyntaxTheme();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (!detection.isCode) {
    return (
      <pre className={`bg-muted/50 p-3 rounded-md overflow-x-auto font-mono text-sm ${className}`}>
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      {showCopyButton && (
        <button
          onClick={handleCopy}
          className="absolute top-2 left-2 z-10 p-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check size={14} className="text-green-500" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      )}

      {showLanguageBadge && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="bg-muted/80 backdrop-blur-sm text-muted-foreground text-xs px-2 py-1 rounded-md font-mono shadow-sm">
            {detection.language}
          </span>
        </div>
      )}

      <div className="rounded-lg overflow-hidden border w-full">
        <div className="w-full overflow-auto">
          <SyntaxHighlighter
            language={detection.language}
            style={syntaxTheme}
            showLineNumbers={showLineNumbers}
            customStyle={{
              margin: 0,
              padding: '1rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              background: 'transparent',
              width: '100%',
              maxWidth: '100%',
              minWidth: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              tableLayout: 'fixed',
            }}
            codeTagProps={{
              style: {
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                display: 'block',
                width: '100%',
              }
            }}
            useInlineStyles={true}
          >
            {displayCode}
          </SyntaxHighlighter>
        </div>
      </div>

      {shouldTruncate && (
        <div className="flex justify-center mt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-primary text-sm hover:underline px-3 py-1 rounded-md hover:bg-primary/10 transition-colors"
          >
            {isExpanded ? (
              <>
                <Eye size={14} />
                Show {lines.length - maxLines} lines less
              </>
            ) : (
              <>
                <Code size={14} />
                Show {lines.length - maxLines} more lines
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
