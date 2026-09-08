import { countGraphemes, countLines } from '../editor/text-metrics';
import { defineTool } from '../core/tools/tool';
import { deburr } from './helpers';

const CATEGORY = 'Text';

export const removeDuplicateLines = defineTool({
  id: 'remove-duplicate-lines',
  name: 'Remove Duplicate Lines',
  description: 'Removes repeated lines, keeping the first occurrence and original order.',
  category: CATEGORY,
  tags: ['lines', 'duplicates', 'unique', 'dedupe'],
  icon: 'filter_list',
  workerEligible: true,
  params: [],
  run: (input) => {
    const seen = new Set<string>();
    return input
      .split('\n')
      .filter((line) => {
        if (seen.has(line)) {
          return false;
        }
        seen.add(line);
        return true;
      })
      .join('\n');
  },
});

export const shuffleLines = defineTool({
  id: 'shuffle-lines',
  name: 'Shuffle Lines',
  description: 'Randomly reorders the lines. The result is non-deterministic.',
  category: CATEGORY,
  tags: ['lines', 'shuffle', 'random'],
  icon: 'shuffle',
  params: [],
  run: (input) => {
    const lines = input.split('\n');
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
    return lines.join('\n');
  },
});

export const naturalSortLines = defineTool({
  id: 'natural-sort-lines',
  name: 'Natural Sort Lines',
  description: 'Sorts lines with numeric awareness, so "item2" comes before "item10".',
  category: CATEGORY,
  tags: ['lines', 'sort', 'natural', 'numeric'],
  icon: 'sort',
  workerEligible: true,
  params: [],
  run: (input) =>
    input
      .split('\n')
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .join('\n'),
});

export const countText = defineTool({
  id: 'count-text',
  name: 'Count Text',
  description: 'Reports the number of characters, words, and lines.',
  category: CATEGORY,
  tags: ['count', 'statistics', 'words', 'lines', 'characters'],
  icon: 'analytics',
  params: [],
  run: (input) => {
    const words = input.trim() === '' ? 0 : input.trim().split(/\s+/).length;
    return [
      `Characters: ${countGraphemes(input)}`,
      `Characters (no spaces): ${countGraphemes(input.replace(/\s/g, ''))}`,
      `Words: ${words}`,
      `Lines: ${countLines(input)}`,
    ].join('\n');
  },
});

const LOREM_WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'fugiat',
  'nulla',
  'pariatur',
];

function loremSentence(wordCount: number, offset: number): string {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(LOREM_WORDS[(offset + i) % LOREM_WORDS.length]);
  }
  const sentence = words.join(' ');
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
}

export const loremIpsum = defineTool({
  id: 'lorem-ipsum',
  name: 'Lorem Ipsum',
  description: 'Generates placeholder paragraphs of lorem ipsum text.',
  category: CATEGORY,
  tags: ['lorem', 'ipsum', 'placeholder', 'generate'],
  icon: 'article',
  params: [
    {
      type: 'number',
      key: 'paragraphs',
      label: 'Paragraphs',
      default: 3,
      integer: true,
      min: 1,
      max: 50,
    },
    {
      type: 'number',
      key: 'sentences',
      label: 'Sentences per paragraph',
      default: 4,
      integer: true,
      min: 1,
      max: 20,
    },
  ],
  run: (_input, params) => {
    const paragraphs: string[] = [];
    let offset = 0;
    for (let p = 0; p < params.paragraphs; p++) {
      const sentences: string[] = [];
      for (let s = 0; s < params.sentences; s++) {
        const length = 6 + ((offset * 3) % 8);
        sentences.push(loremSentence(length, offset));
        offset += length;
      }
      paragraphs.push(sentences.join(' '));
    }
    return paragraphs.join('\n\n');
  },
});

export const rot13 = defineTool({
  id: 'rot13',
  name: 'ROT13',
  description: 'Applies the ROT13 letter substitution cipher.',
  category: CATEGORY,
  tags: ['rot13', 'cipher', 'obfuscate'],
  icon: 'lock',
  params: [],
  run: (input) =>
    input.replace(/[a-zA-Z]/g, (char) => {
      const base = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
    }),
});

export const slugify = defineTool({
  id: 'slugify',
  name: 'Slugify',
  description: 'Converts text to a URL-friendly slug.',
  category: CATEGORY,
  tags: ['slug', 'url', 'kebab', 'permalink'],
  icon: 'link',
  params: [],
  run: (input) =>
    deburr(input)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, ''),
});

const SMART_QUOTES: Readonly<Record<string, string>> = {
  '“': '"',
  '”': '"',
  '„': '"',
  '‟': '"',
  '«': '"',
  '»': '"',
  '‘': "'",
  '’': "'",
  '‚': "'",
  '‛': "'",
  '–': '-',
  '—': '-',
  '…': '...',
};

export const replaceSmartQuotes = defineTool({
  id: 'replace-smart-quotes',
  name: 'Replace Smart Quotes',
  description: 'Replaces curly quotes, dashes, and ellipses with plain ASCII equivalents.',
  category: CATEGORY,
  tags: ['quotes', 'ascii', 'normalize', 'typography'],
  icon: 'format_quote',
  params: [],
  run: (input) => input.replace(/[“”„‟«»‘’‚‛–—…]/g, (char) => SMART_QUOTES[char] ?? char),
});

export const TEXT_UTILITY_TOOLS = [
  removeDuplicateLines,
  shuffleLines,
  naturalSortLines,
  countText,
  loremIpsum,
  rot13,
  slugify,
  replaceSmartQuotes,
] as const;
