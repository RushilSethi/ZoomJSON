export type CodeLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'c' | 'csharp' | 'php' | 'ruby' | 'go' | 'rust' | 'html' | 'css' | 'json' | 'xml' | 'sql' | 'bash' | 'markdown' | 'yaml' | 'dockerfile' | 'plaintext';

export interface CodeDetectionResult {
  language: CodeLanguage;
  confidence: number;
  isCode: boolean;
}

const languagePatterns: Record<CodeLanguage, RegExp[]> = {
  javascript: [
    /function\s+\w+\s*\(/,
    /const\s+\w+\s*=/,
    /let\s+\w+\s*=/,
    /var\s+\w+\s*=/,
    /=>\s*{/,
    /console\.log/,
    /import\s+.*from/,
    /export\s+(default\s+)?(const|function|class)/,
  ],
  typescript: [
    /interface\s+\w+/,
    /type\s+\w+\s*=/,
    /:\s*(string|number|boolean|void|any)/,
    /as\s+\w+/,
    /<\w+>/,
    /private|public|protected/,
    /declare\s+(const|function|class)/,
  ],
  python: [
    /def\s+\w+\s*\(/,
    /import\s+\w+/,
    /from\s+\w+\s+import/,
    /print\s*\(/,
    /class\s+\w+\s*:/,
    /if\s+__name__\s*==\s*['"']__main__['"']/,
    /#.*$/,
    /\s{4,}/,
  ],
  java: [
    /public\s+class\s+\w+/,
    /private\s+\w+\s+\w+\s*=/,
    /public\s+\w+\s+\w+\s*\(/,
    /System\.out\.print/,
    /import\s+java\./,
    /@Override/,
    /static\s+void\s+main/,
  ],
  cpp: [
    /#include\s*<.*>/,
    /std::/,
    /cout\s*<</,
    /cin\s*>>/,
    /int\s+main\s*\(/,
    /using\s+namespace\s+std/,
    /->/,
    /\*\w+/,
  ],
  c: [
    /#include\s*<.*>/,
    /printf\s*\(/,
    /scanf\s*\(/,
    /int\s+main\s*\(/,
    /malloc\s*\(/,
    /free\s*\(/,
    /\*w+/,
    /typedef\s+/,
  ],
  csharp: [
    /using\s+System/,
    /public\s+class\s+\w+/,
    /Console\.Write/,
    /private\s+\w+\s+\w+\s*[{;]/,
    /public\s+\w+\s+\w+\s*\(/,
    /@override/i,
    /namespace\s+\w+/,
  ],
  php: [
    /<\?php/,
    /\$\w+/,
    /function\s+\w+\s*\(/,
    /echo\s+/,
    /include\s+/,
    /require\s+/,
    /class\s+\w+/,
    /->\w+/,
  ],
  ruby: [
    /def\s+\w+/,
    /class\s+\w+/,
    /puts\s+/,
    /require\s+/,
    /@w+/,
    /\.\w+/,
    /do\s+\|/,
    /end\s*$/,
  ],
  go: [
    /package\s+\w+/,
    /func\s+\w+\s*\(/,
    /import\s+/,
    /fmt\.Print/,
    /var\s+\w+/,
    /:=/,
    /type\s+\w+/,
    /struct\s+\w+/,
  ],
  rust: [
    /fn\s+\w+\s*\(/,
    /let\s+mut\s+\w+/,
    /use\s+.*;/,
    /println!/,
    /struct\s+\w+/,
    /impl\s+\w+/,
    /->\s+\w+/,
    /#\[derive\(/,
  ],
  html: [
    /<html/i,
    /<body/i,
    /<div/i,
    /<span/i,
    /<p>/i,
    /<script/i,
    /<style/i,
    /<head/i,
    /<!DOCTYPE/i,
  ],
  css: [
    /\{\s*[\w-]+\s*:\s*[^}]+\}/,
    /\.[\w-]+\s*\{/,
    /#[\w-]+\s*\{/,
    /@media/,
    /@import/,
    /color\s*:/,
    /background\s*:/,
    /margin\s*:/,
  ],
  json: [
    /^\s*{\s*".*"\s*:/,
    /^\s*\[\s*{/,
    /:\s*".*"/,
    /:\s*\d+/,
    /:\s*(true|false|null)/,
    /,\s*"/,
  ],
  xml: [
    /<\?xml/,
    /<[^>]+>/,
    /<\/[^>]+>/,
    /<[^>]+\/>/,
    /<!--.*-->/,
  ],
  sql: [
    /SELECT\s+.*FROM/i,
    /INSERT\s+INTO/i,
    /UPDATE\s+.*SET/i,
    /DELETE\s+FROM/i,
    /CREATE\s+TABLE/i,
    /DROP\s+TABLE/i,
    /WHERE\s+/i,
    /JOIN\s+/i,
  ],
  bash: [
    /^#!\/bin\/bash/,
    /export\s+\w+/,
    /if\s+\[/,
    /for\s+\w+\s+in/,
    /echo\s+/,
    /\$\{?\w+\}?/,
    /\|\|/,
    /&&/,
  ],
  markdown: [
    /^#+\s+/,
    /\*\*.*\*\*/,
    /\*.*\*/,
    /^\s*[-*+]\s+/,
    /^\s*\d+\.\s+/,
    /\[.*\]\(.*\)/,
    /```/,
    /^>/,
  ],
  yaml: [
    /^\w+\s*:/,
    /^\s*-\s+/,
    /:\s*\[/,
    /:\s*{/,
    /true|false|null/,
    /\|\s*$/,
    />\s*$/,
  ],
  dockerfile: [
    /^FROM\s+/i,
    /^RUN\s+/i,
    /^COPY\s+/i,
    /^ADD\s+/i,
    /^CMD\s+/i,
    /^ENTRYPOINT\s+/i,
    /^EXPOSE\s+/i,
    /^ENV\s+/i,
  ],
  plaintext: [],
};

export function detectCodeLanguage(text: string): CodeDetectionResult {
  const trimmedText = text.trim();
  
  if (!trimmedText || trimmedText.length < 10) {
    return { language: 'plaintext', confidence: 0, isCode: false };
  }

  const scores: Record<CodeLanguage, number> = {} as Record<CodeLanguage, number>;
  
  for (const [language, patterns] of Object.entries(languagePatterns)) {
    if (language === 'plaintext') continue;
    
    let score = 0;
    let patternMatches = 0;
    
    for (const pattern of patterns) {
      const matches = trimmedText.match(pattern);
      if (matches) {
        score += matches.length;
        patternMatches++;
      }
    }
    
    if (patternMatches > 0) {
      scores[language as CodeLanguage] = score / patterns.length;
    }
  }

  if (Object.keys(scores).length === 0) {
    return { language: 'plaintext', confidence: 0, isCode: false };
  }

  const bestLanguage = Object.entries(scores).reduce((a, b) => 
    scores[a[0] as CodeLanguage] > scores[b[0] as CodeLanguage] ? a : b
  ) as [CodeLanguage, number];

  const confidence = Math.min(bestLanguage[1] * 100, 100);
  const isCode = confidence > 20;

  return {
    language: bestLanguage[0],
    confidence,
    isCode,
  };
}

export function isHtmlContent(text: string): boolean {
  const trimmedText = text.trim();
  
  // Don't treat JSON arrays/objects as HTML even if they contain HTML strings
  if ((trimmedText.startsWith('[') && trimmedText.endsWith(']')) ||
      (trimmedText.startsWith('{') && trimmedText.endsWith('}'))) {
    return false;
  }
  
  const htmlPatterns = [
    /^<[^>]+>/, // Starts with an HTML tag
    /<html/i,
    /<body/i,
    /<div/i,
    /<span/i,
    /<p>/i,
    /<script/i,
    /<style/i,
    /<head/i,
    /<!DOCTYPE/i,
    /&[a-zA-Z]+;/,
  ];
  
  return htmlPatterns.some(pattern => pattern.test(trimmedText));
}

export function formatCodeForDisplay(text: string, language: CodeLanguage): string {
  if (language === 'json') {
    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return text;
    }
  }
  
  return text;
}
