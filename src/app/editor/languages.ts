import type { Extension } from '@codemirror/state';

export const PLAINTEXT = 'plaintext';
export const MARKDOWN = 'markdown';

export interface EditorLanguage {
  readonly id: string;
  readonly label: string;
  readonly extensions: readonly string[];
  readonly load: () => Promise<Extension>;
}

export const EDITOR_LANGUAGES: readonly EditorLanguage[] = [
  {
    id: 'json',
    label: 'JSON',
    extensions: ['json'],
    load: async () => (await import('@codemirror/lang-json')).json(),
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    extensions: ['js', 'mjs', 'cjs', 'jsx'],
    load: async () => (await import('@codemirror/lang-javascript')).javascript({ jsx: true }),
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    extensions: ['ts', 'tsx'],
    load: async () =>
      (await import('@codemirror/lang-javascript')).javascript({ jsx: true, typescript: true }),
  },
  {
    id: 'html',
    label: 'HTML',
    extensions: ['html', 'htm'],
    load: async () => (await import('@codemirror/lang-html')).html(),
  },
  {
    id: 'css',
    label: 'CSS',
    extensions: ['css'],
    load: async () => (await import('@codemirror/lang-css')).css(),
  },
  {
    id: 'xml',
    label: 'XML',
    extensions: ['xml', 'svg', 'xsd', 'xsl'],
    load: async () => (await import('@codemirror/lang-xml')).xml(),
  },
  {
    id: 'markdown',
    label: 'Markdown',
    extensions: ['md', 'markdown'],
    load: async () => (await import('@codemirror/lang-markdown')).markdown(),
  },
  {
    id: 'yaml',
    label: 'YAML',
    extensions: ['yaml', 'yml'],
    load: async () => (await import('@codemirror/lang-yaml')).yaml(),
  },
  {
    id: 'sql',
    label: 'SQL',
    extensions: ['sql'],
    load: async () => (await import('@codemirror/lang-sql')).sql(),
  },
];

export function languageLabel(id: string): string {
  return EDITOR_LANGUAGES.find((language) => language.id === id)?.label ?? 'Plain text';
}

export function loadLanguage(id: string): Promise<Extension> | null {
  return EDITOR_LANGUAGES.find((language) => language.id === id)?.load() ?? null;
}

/** Guesses a language id from the document name's extension, then the content. */
export function detectLanguage(name: string, content: string): string {
  const extension = /\.([a-z0-9]+)$/i.exec(name.trim())?.[1]?.toLowerCase();
  if (extension) {
    const byExtension = EDITOR_LANGUAGES.find((language) =>
      language.extensions.includes(extension),
    );
    if (byExtension) {
      return byExtension.id;
    }
  }
  return detectFromContent(content);
}

function detectFromContent(content: string): string {
  const trimmed = content.trim();
  if (trimmed === '') {
    return PLAINTEXT;
  }
  if (/^[{[]/.test(trimmed) && isProbablyJson(trimmed)) {
    return 'json';
  }
  if (/^---\s*$/m.test(trimmed.split('\n')[0] ?? '')) {
    return 'yaml';
  }
  if (/^<\?xml/i.test(trimmed)) {
    return 'xml';
  }
  if (/^<(!doctype html|html|div|span|body|head|p|a|ul|section)/i.test(trimmed)) {
    return 'html';
  }
  if (/^\s*(select|insert|update|delete|create|alter|drop)\b/i.test(trimmed)) {
    return 'sql';
  }
  if (/^#{1,6}\s|\n#{1,6}\s|^[-*]\s|\]\(/m.test(trimmed)) {
    return 'markdown';
  }
  return PLAINTEXT;
}

function isProbablyJson(trimmed: string): boolean {
  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
}
