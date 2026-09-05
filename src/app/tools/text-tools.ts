import { defineTool, failure } from '../core/tools/tool';

const CATEGORY = 'Text';

export const sortLinesAsc = defineTool({
  id: 'sort-lines-asc',
  name: 'Sort Lines Asc',
  description: 'Sorts lines in ascending order.',
  category: CATEGORY,
  tags: ['sort', 'lines', 'ascending'],
  icon: 'sort_by_alpha',
  workerEligible: true,
  params: [],
  run: (input) => input.split('\n').sort().join('\n'),
});

export const sortLinesDesc = defineTool({
  id: 'sort-lines-desc',
  name: 'Sort Lines Desc',
  description: 'Sorts lines in descending order.',
  category: CATEGORY,
  tags: ['sort', 'lines', 'descending'],
  icon: 'sort_by_alpha',
  workerEligible: true,
  params: [],
  run: (input) => input.split('\n').sort().reverse().join('\n'),
});

export const reverseText = defineTool({
  id: 'reverse-text',
  name: 'Text Reverser',
  description: 'Reverses the order of characters.',
  category: CATEGORY,
  tags: ['reverse', 'mirror'],
  icon: 'reorder',
  params: [],
  run: (input) => [...input].reverse().join(''),
});

export const trim = defineTool({
  id: 'trim',
  name: 'Trim',
  description: 'Removes whitespace from both ends of the text.',
  category: CATEGORY,
  tags: ['trim', 'whitespace'],
  icon: 'content_cut',
  params: [],
  run: (input) => input.trim(),
});

export const split = defineTool({
  id: 'split',
  name: 'Split',
  description: 'Splits the text on a separator, keeping up to a limit of parts.',
  category: CATEGORY,
  tags: ['split', 'divide', 'separator'],
  icon: 'call_split',
  params: [
    { type: 'text', key: 'separator', label: 'Separator', default: '-' },
    { type: 'number', key: 'limit', label: 'Limit', default: 2, integer: true, min: 0 },
  ],
  run: (input, params) => input.split(params.separator, params.limit).toString(),
});

export const repeat = defineTool({
  id: 'repeat',
  name: 'Repeat',
  description: 'Repeats the text a given number of times.',
  category: CATEGORY,
  tags: ['repeat', 'duplicate'],
  icon: 'repeat',
  params: [
    {
      type: 'number',
      key: 'times',
      label: 'Times',
      default: 3,
      integer: true,
      min: 0,
      max: 100000,
    },
  ],
  run: (input, params) => input.repeat(params.times),
});

export const minifyJson = defineTool({
  id: 'minify-json',
  name: 'Minify JSON',
  description: 'Removes whitespace from a JSON document.',
  category: CATEGORY,
  tags: ['json', 'minify', 'compact'],
  icon: 'cleaning_services',
  workerEligible: true,
  params: [],
  run: (input) => {
    try {
      return JSON.stringify(JSON.parse(input));
    } catch (error) {
      return failure(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

export const TEXT_TOOLS = [
  sortLinesAsc,
  sortLinesDesc,
  reverseText,
  trim,
  split,
  repeat,
  minifyJson,
] as const;
