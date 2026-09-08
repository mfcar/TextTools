import { defineTool, failure } from '../core/tools/tool';

const CATEGORY = 'Format';

function jsonError(error: unknown): string {
  return `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`;
}

export const formatJson = defineTool({
  id: 'format-json',
  name: 'Format JSON',
  description: 'Pretty-prints a JSON document with the given indentation.',
  category: CATEGORY,
  tags: ['json', 'format', 'beautify', 'pretty'],
  icon: 'data_object',
  workerEligible: true,
  params: [
    { type: 'number', key: 'indent', label: 'Indent', default: 2, integer: true, min: 0, max: 10 },
  ],
  run: (input, params) => {
    try {
      return JSON.stringify(JSON.parse(input), null, params.indent);
    } catch (error) {
      return failure(jsonError(error));
    }
  },
});

function formatXml(xml: string): string {
  const collapsed = xml.replace(/>\s+</g, '><').trim();
  const withBreaks = collapsed.replace(/></g, '>\n<');
  const lines = withBreaks.split('\n');
  let indent = 0;
  const out: string[] = [];
  for (const line of lines) {
    const isClosing = /^<\//.test(line);
    const isOpening = /^<[a-zA-Z]/.test(line) && !/\/>$/.test(line) && !/^<[^>]+>.*<\//.test(line);
    if (isClosing) {
      indent = Math.max(0, indent - 1);
    }
    out.push('  '.repeat(indent) + line);
    if (isOpening) {
      indent += 1;
    }
  }
  return out.join('\n');
}

export const formatXmlTool = defineTool({
  id: 'format-xml',
  name: 'Format XML',
  description: 'Indents XML or HTML markup one element per line.',
  category: CATEGORY,
  tags: ['xml', 'html', 'format', 'beautify', 'pretty'],
  icon: 'code',
  workerEligible: true,
  params: [],
  run: (input) => (input.trim() === '' ? '' : formatXml(input)),
});

export const minifyXml = defineTool({
  id: 'minify-xml',
  name: 'Minify XML',
  description: 'Removes whitespace between XML or HTML tags.',
  category: CATEGORY,
  tags: ['xml', 'html', 'minify', 'compact'],
  icon: 'compress',
  workerEligible: true,
  params: [],
  run: (input) => input.replace(/>\s+</g, '><').trim(),
});

function formatCss(css: string): string {
  const broken = css
    .replace(/\s*\{\s*/g, ' {\n')
    .replace(/;\s*/g, ';\n')
    .replace(/\s*\}\s*/g, '\n}\n');
  const lines = broken
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  let indent = 0;
  const out: string[] = [];
  for (const line of lines) {
    if (line === '}') {
      indent = Math.max(0, indent - 1);
      out.push('  '.repeat(indent) + line);
    } else if (line.endsWith('{')) {
      out.push('  '.repeat(indent) + line);
      indent += 1;
    } else {
      out.push('  '.repeat(indent) + line);
    }
  }
  return out.join('\n');
}

export const formatCssTool = defineTool({
  id: 'format-css',
  name: 'Format CSS',
  description: 'Beautifies CSS with one declaration per line.',
  category: CATEGORY,
  tags: ['css', 'format', 'beautify', 'pretty'],
  icon: 'style',
  workerEligible: true,
  params: [],
  run: (input) => (input.trim() === '' ? '' : formatCss(input)),
});

export const minifyCss = defineTool({
  id: 'minify-css',
  name: 'Minify CSS',
  description: 'Strips comments and collapses whitespace in CSS.',
  category: CATEGORY,
  tags: ['css', 'minify', 'compact'],
  icon: 'compress',
  workerEligible: true,
  params: [],
  run: (input) =>
    input
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}:;,])\s*/g, '$1')
      .replace(/;}/g, '}')
      .trim(),
});

const SQL_KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'GROUP',
  'BY',
  'ORDER',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'UNION',
  'ALL',
  'INSERT',
  'INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE',
  'JOIN',
  'INNER',
  'LEFT',
  'RIGHT',
  'OUTER',
  'ON',
  'AND',
  'OR',
  'AS',
  'IN',
  'NOT',
  'NULL',
  'LIKE',
  'BETWEEN',
  'DISTINCT',
  'COUNT',
  'DESC',
  'ASC',
];

const SQL_CLAUSES = [
  'FROM',
  'WHERE',
  'GROUP BY',
  'ORDER BY',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'UNION ALL',
  'UNION',
  'INSERT INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE FROM',
  'INNER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'OUTER JOIN',
  'JOIN',
];

function formatSql(sql: string): string {
  let result = sql.replace(/\s+/g, ' ').trim();
  for (const keyword of SQL_KEYWORDS) {
    result = result.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), keyword);
  }
  for (const clause of SQL_CLAUSES) {
    result = result.replace(new RegExp(`\\s+${clause}\\b`, 'g'), `\n${clause}`);
  }
  return result.replace(/\s+(AND|OR)\b/g, '\n  $1').trim();
}

export const formatSqlTool = defineTool({
  id: 'format-sql',
  name: 'Format SQL',
  description: 'Applies basic SQL formatting: uppercased keywords and clauses on new lines.',
  category: CATEGORY,
  tags: ['sql', 'format', 'beautify', 'pretty'],
  icon: 'database',
  workerEligible: true,
  params: [],
  run: (input) => (input.trim() === '' ? '' : formatSql(input)),
});

export const FORMAT_TOOLS = [
  formatJson,
  formatXmlTool,
  minifyXml,
  formatCssTool,
  minifyCss,
  formatSqlTool,
] as const;
