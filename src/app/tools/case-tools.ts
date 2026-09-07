import { defineTool } from '../core/tools/tool';
import { deburr, toWords } from './helpers';

const CATEGORY = 'Case';

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export const uppercase = defineTool({
  id: 'uppercase',
  name: 'Uppercase',
  description: 'Converts all text to UPPERCASE.',
  category: CATEGORY,
  tags: ['case', 'upper'],
  icon: 'text_format',
  params: [],
  run: (input) => input.toUpperCase(),
});

export const lowercase = defineTool({
  id: 'lowercase',
  name: 'Lowercase',
  description: 'Converts all text to lowercase.',
  category: CATEGORY,
  tags: ['case', 'lower'],
  icon: 'text_format',
  params: [],
  run: (input) => input.toLowerCase(),
});

export const camelCase = defineTool({
  id: 'camel-case',
  name: 'Camel Case',
  description: 'Converts text to camelCase.',
  category: CATEGORY,
  tags: ['case', 'camel'],
  icon: 'text_format',
  params: [],
  run: (input) =>
    toWords(input)
      .map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word.toLowerCase())))
      .join(''),
});

export const kebabCase = defineTool({
  id: 'kebab-case',
  name: 'Kebab Case',
  description: 'Converts text to kebab-case.',
  category: CATEGORY,
  tags: ['case', 'kebab', 'dash'],
  icon: 'text_format',
  params: [],
  run: (input) =>
    toWords(input)
      .map((word) => word.toLowerCase())
      .join('-'),
});

export const snakeCase = defineTool({
  id: 'snake-case',
  name: 'Snake Case',
  description: 'Converts text to snake_case.',
  category: CATEGORY,
  tags: ['case', 'snake', 'underscore'],
  icon: 'text_format',
  params: [],
  run: (input) =>
    toWords(input)
      .map((word) => word.toLowerCase())
      .join('_'),
});

export const deburrTool = defineTool({
  id: 'deburr',
  name: 'Deburr',
  description: 'Removes accents and diacritics from letters.',
  category: CATEGORY,
  tags: ['deburr', 'accents', 'diacritics', 'normalize'],
  icon: 'text_format',
  params: [],
  run: (input) => deburr(input),
});

export const CASE_TOOLS = [
  uppercase,
  lowercase,
  camelCase,
  kebabCase,
  snakeCase,
  deburrTool,
] as const;
